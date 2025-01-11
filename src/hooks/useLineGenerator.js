import { useEffect, useState } from "react";
import { eventNameEnum, svgTypeEnum } from "../utils/enums";
import { SvgIdAndMutablePropsManager } from "../eventTarget/SvgIdAndMutablePropsManager";

export const useLineGenerator = (
  addSvgOnStore,
  setCurrentEvent,
  setTempPos,
) => {
  const generateNextId =
    SvgIdAndMutablePropsManager.getInstance().generateNextId;
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (points.length > 1) {
      const key = generateNextId(svgTypeEnum.line);
      const src = points[0];
      const dest = points[1];
      const width = Math.sqrt(
        (src.x - dest.x) * (src.x - dest.x) +
          (src.y - dest.y) * (src.y - dest.y),
      );
      const height = 20;
      const attachment = {
        src,
        dest,
        width,
        height,
      };

      addSvgOnStore(key, attachment);
      setCurrentEvent(eventNameEnum.none);
      setPoints([]);

      setTimeout(() => {
        setTempPos(new Map());
      }, 2500);
    }
  }, [points]);

  const addPoint = (point) => {
    setPoints((prev) => [...prev, point]);
  };

  const quit = () => {
    setPoints([]);
  };

  return {
    addPoint,
    quit,
  };
};
