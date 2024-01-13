import { useEffect, useState } from "react";
import { useSvgIdGenerator } from "./useSvgIdGenerator";
import { svgTypeEnum } from "../utils/enums";

export const MMMKey = {
  minX: "minX",
  minY: "minY",
  maxX: "maxX",
  maxY: "maxY",
};

export const usePathGenerator = (addSvgOnStore) => {
  const [pointSet, setPointSet] = useState(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [minMaxMap, setMinMaxMap] = useState(new Map());
  const [thickness, setThickness] = useState(3);
  const [pid, setPid] = useState("");
  const { generateNextId } = useSvgIdGenerator();

  useEffect(() => {
    if (pointSet.size === 0) {
      if (pid === "") {
        setPid(svgTypeEnum.path + generateNextId());
      }
      initMinMaxMap();
      return;
    }

    if (!isDrawing) {
      setPointSet(new Set());
      setPid("");
      return;
    }

    // if (isDrawing) {
    const parseArray = [];

    for (const dataString of pointSet) {
      const parse = JSON.parse(dataString);
      const fixPos = {
        x: parse.x - minMaxMap.get(MMMKey.minX) + thickness / 2,
        y: parse.y - minMaxMap.get(MMMKey.minY) + thickness / 2,
      };
      parseArray.push(fixPos);
    }

    const key = pid;
    const src = {
      x: minMaxMap.get(MMMKey.minX) - thickness / 2,
      y: minMaxMap.get(MMMKey.minY) - thickness / 2,
    };
    const width = minMaxMap.get(MMMKey.maxX) - src.x;
    const height = minMaxMap.get(MMMKey.maxY) - src.y;

    const attach = {
      src,
      width,
      height,
      parseArray,
      thickness,
    };

    addSvgOnStore((prev) => new Map(prev).set(key, attach));
    // }
  }, [pointSet, isDrawing]);

  const addPointOnSet = (point) => {
    if (isDrawing) {
      const pointString = JSON.stringify(point);
      pointSet.add(pointString);
      setPointSet((prev) => new Set([...prev, pointString]));

      setMinMaxMap(() => {
        const mapUpdate = new Map();

        mapUpdate
          .set(MMMKey.minX, Math.min(minMaxMap.get(MMMKey.minX), point.x))
          .set(MMMKey.maxX, Math.max(minMaxMap.get(MMMKey.maxX), point.x))
          .set(MMMKey.minY, Math.min(minMaxMap.get(MMMKey.minY), point.y))
          .set(MMMKey.maxY, Math.max(minMaxMap.get(MMMKey.maxY), point.y));

        return mapUpdate;
      });
    }
  };

  const deletePoint = (point) => {
    const pointString = JSON.stringify(point);
    setPointSet((prev) => {
      prev.delete(pointString);
      return new Set([...prev]);
    });
  };

  const initMinMaxMap = () => {
    setMinMaxMap(() => {
      const mapInit = new Map();

      mapInit
        .set(MMMKey.minX, 9999)
        .set(MMMKey.maxX, 0)
        .set(MMMKey.minY, 9999)
        .set(MMMKey.maxY, 0);

      return mapInit;
    });
  };

  return {
    addPointOnSet,
    deletePoint,
    setIsDrawing,
  };
};