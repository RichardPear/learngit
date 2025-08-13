import React, { useEffect } from "react";

// 定义类型
interface Option {
  label: string;
  value: string;
  children?: Option[];
}

interface CascaderProps {
  data: Option[];
  value?: string[]; // 受控选中值
  onChange?: (value: string[]) => void;
}

const Cascader: React.FC<CascaderProps> = ({ data, value = [], onChange }) => {
  // 获取每一层级的 options
  const getOptionsByLevel = (level: number): Option[] => {
    if (level === 0) return data;

    const prevSelected = value[level - 1];
    if (!prevSelected) {
      // 上一级未选，聚合所有子节点
      const prevLevelOptions = getOptionsByLevel(level - 1);
      return prevLevelOptions.flatMap((o) => o.children || []);
    } else {
      const prevLevelOptions = getOptionsByLevel(level - 1);
      const node = prevLevelOptions.find((o) => o.value === prevSelected);
      return node?.children || [];
    }
  };

  // 计算总层级数
  const getMaxLevel = (): number => {
    let level = 0;
    let opts: Option[] = data;
    while (opts && opts.length > 0) {
      level++;
      const selected = value[level - 1];
      if (selected) {
        const node = opts.find((o) => o.value === selected);
        opts = node?.children || [];
      } else {
        opts = opts.flatMap((o) => o.children || []);
      }
      if (opts.length === 0) break;
    }
    return level;
  };

  const levels = getMaxLevel();
  const selects: JSX.Element[] = [];

  for (let level = 0; level < levels; level++) {
    const opts = getOptionsByLevel(level);
    selects.push(
      <select
        key={level}
        value={value[level] || ""}
        onChange={(e) => {
          const newValue = value.slice(0, level);
          newValue[level] = e.target.value;
          onChange?.(newValue);
        }}
      >
        <option value="">请选择</option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return <div>{selects}</div>;
};

// ================= 使用示例 =================

const options: Option[] = [
  {
    label: "水果",
    value: "fruit",
    children: [
      { label: "苹果", value: "apple" },
      { label: "香蕉", value: "banana" },
      { label: "橙子", value: "orange" },
    ],
  },
  {
    label: "蔬菜",
    value: "vegetable",
    children: [
      { label: "胡萝卜", value: "carrot" },
      { label: "黄瓜", value: "cucumber" },
    ],
  },
  {
    label: "肉",
    value: "pork",
    children: [
      {
        label: "🐷",
        value: "pig",
        children: [
          { label: "🐷1", value: "pig1" },
          { label: "🐷2", value: "pig2" },
        ],
      },
      { label: "🐮", value: "cow" },
    ],
  },
];

export default function App() {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  useEffect(() => {
    console.log(selectedValues, "selectedValues");
  }, [selectedValues]);
  return (
    <div>
      <Cascader
        data={options}
        value={selectedValues}
        onChange={setSelectedValues}
      />
      <div style={{ marginTop: 10 }}>
        当前选中: {selectedValues.filter(Boolean).join(" / ")}
      </div>
    </div>
  );
}
