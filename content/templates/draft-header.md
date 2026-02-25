# 草稿文件头部模板

<!-- 复制以下 YAML frontmatter 到每个草稿文件的开头 -->

```yaml
---
type:                    # scene-sketch | preview-chapter
status: draft            # draft | reference | promoted | discarded
relates_to: ""           # 与大纲的松散关联
created: YYYY-MM-DD
assumptions: []          # 仅 preview-chapter 使用：列出预写时的假设前提
note: ""                 # 当 status 变为 reference 时填写保留理由
---
```

## 状态说明

- **draft**: 初始状态，未经审阅
- **reference**: 保留为参考素材，note 中说明保留理由
- **promoted**: 已提升为正式章节，移入 chapters/
- **discarded**: 已废弃，AI 不再参考此文件

## type 说明

- **scene-sketch**: 独立场景片段，不在当前章节序列中
- **preview-chapter**: 预览未来某章节，在前置章节尚未完成时先行创作
