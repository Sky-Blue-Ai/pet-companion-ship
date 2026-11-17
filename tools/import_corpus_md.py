#!/usr/bin/env python3
"""
把「AI 宠物资产预料库」Markdown 导入成本仓库的语料 JSON

输入：petlib.md（用户提供的资料库，20 段 × 60 条 = 1200 条）
输出：corpus/cat_orange.json、corpus/dog_shiba.json

映射要点：
- 原始语气档是 soft / vivid / gentle（情绪风格），本仓库按「亲密度」分三档，
  所以用 tierMap 做映射：low→gentle / mid→soft / high→vivid，语料保持原样。
- 原始文档没有关键词列，关键词表在下面的 KEYWORDS 里补齐。
- 槽位沿用原始文档的 {call}{soft}{purr}{act}{tail}{sp}{pet}{food}{toy}{name}。
"""
import json
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/petlib.md"

# 中文意图名 → 英文 id + 关键词
INTENTS = {
    "打招呼": ("greet_home", ["我回来了", "回来了", "回来啦", "哈喽"]),
    "饿了求喂": ("feed_ask", ["饿", "吃饭", "吃了没", "饭盆"]),
    "吃完满足": ("after_eat", ["好吃", "吃完了", "吃饱", "饱了"]),
    "想玩": ("play_invite", ["玩吗", "来玩", "陪你玩", "逗你"]),
    "无聊": ("bored", ["无聊", "没事做", "发呆"]),
    "困了": ("sleepy", ["困", "打哈欠", "想睡"]),
    "被摸头": ("pet_head", ["摸摸", "摸头", "撸", "抱抱"]),
    "被夸奖": ("praise", ["好可爱", "真棒", "乖", "喜欢你"]),
    "生气/不满": ("upset", ["讨厌", "烦", "生气", "笨"]),
    "清洁后": ("cleaned", ["洗澡", "擦干净", "洗干净"]),
    "不舒服": ("sick_comfort", ["生病", "不舒服", "难受", "吃药"]),
    "想出门": ("want_out", ["出门", "散步", "出去玩"]),
    "睡觉晚安": ("night", ["晚安", "睡觉", "睡了"]),
    "早上问早": ("morning", ["早安", "早上好", "起床"]),
    "撒娇": ("cuddle", ["撒娇", "蹭蹭", "要抱"]),
    "提醒喝水": ("remind_water", ["喝水", "渴了", "水杯"]),
    "升级/成长": ("levelup", ["升级", "长大", "成长", "几天了"]),
    "节日祝福": ("festival", ["节日", "新年", "春节", "生日"]),
    "等主人回家": ("wait_home", ["等你", "等我", "什么时候回来"]),
    "道别": ("bye", ["拜拜", "再见", "上班", "出门了"]),
}

PERSONA = {
    "cat": {"tone": "soft_cat", "sentenceMax": 24, "tic": "喵", "calls": "喵"},
    "dog": {"tone": "soft_dog", "sentenceMax": 24, "tic": "汪", "calls": "汪"},
}

SLOTS = {
    "call": {"cat": "喵", "dog": "汪"},
    "soft": {"cat": "呜", "dog": "呜呜"},
    "purr": {"cat": "呼噜呼噜", "dog": "哼哼唧唧"},
    "act": {"cat": "蹭蹭", "dog": "扑过来"},
    "tail": {"cat": "尾巴", "dog": "尾巴"},
    "sp": {"cat": "猫", "dog": "狗"},
    "pet": {"cat": "摸摸头", "dog": "摸摸头"},
    "food": {"cat": "小鱼干", "dog": "肉肉"},
    "toy": {"cat": "毛线球", "dog": "飞盘"},
    "name": {"cat": "团子", "dog": "豆豆"},
}

ROW = re.compile(r"^\|\s*([^|]+?)\s*\|\s*(soft|vivid|gentle)\s*\|\s*(猫|狗)\s*\|\s*([^|]+?)\s*\|")

def parse(path: str):
    text = open(path, encoding="utf-8").read()
    # 只取「1.4 语料全文」到「二、美术切图规范」之间
    start = text.index("### 1.4 语料全文")
    end = text.index("## 二、美术切图规范")
    body = text[start:end].split("\n")

    out = {"cat": {}, "dog": {}}   # out[species][intent_cn][tier] = [text]
    section = None
    for line in body:
        if line.startswith("#### "):
            title = line[5:].strip()
            section = re.sub(r"（.*?）", "", title).strip()
            continue
        m = ROW.match(line)
        if not m or not section:
            continue
        _id, tier, cn_sp, text_col = m.groups()
        species = "cat" if cn_sp == "猫" else "dog"
        text = text_col.strip()
        if not text or text.startswith("-"):
            continue
        out[species].setdefault(section, {}).setdefault(tier, []).append(text)
    return out

def build(data, species_key):
    intents = {}
    total = 0
    for cn_name, (en_id, keywords) in INTENTS.items():
        tiers = data.get(cn_name)
        if not tiers:
            print(f"WARN 缺意图段落：{cn_name}")
            continue
        intents[en_id] = {"keywords": keywords, "tiers": tiers}
        total += sum(len(v) for v in tiers.values())

    # 兜底意图（原文档没有，按物种补三条）
    calls = SLOTS["call"][species_key]
    intents["fallback_pet"] = {
        "keywords": [],
        "tiers": {"default": [f"（歪头）{calls}？", "（安静地看着你）", "（凑近闻了闻你的手）"]},
    }

    return {
        "species": "cat_orange" if species_key == "cat" else "dog_shiba",
        "version": "v1-petlib",
        "source": "AI 宠物资产预料库 v1.0",
        "persona": {**PERSONA[species_key], "tierMap": {"low": "gentle", "mid": "soft", "high": "vivid"}},
        "slots": {k: v[species_key] for k, v in SLOTS.items()},
        "intents": intents,
        "_total": total,
    }

if __name__ == "__main__":
    parsed = parse(SRC)
    for sp, path in (("cat", "corpus/cat_orange.json"), ("dog", "corpus/dog_shiba.json")):
        data = build(parsed[sp], sp)
        total = data.pop("_total")
        json.dump(data, open(path, "w"), ensure_ascii=False, indent=1)
        print(f"{path}: {total} 条，{len(data['intents'])} 意图")