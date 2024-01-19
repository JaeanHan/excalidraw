import { useEffect, useState } from "react";

export const useSvgStore = () => {
  const [store, setStore] = useState(new Map());
  const [liveStore, setLiveStore] = useState([]);
  const [isInit, setIsInit] = useState(true);

  const load = (loadData) => {
    if (!isInit) return;
    setIsInit(false);

    const loadMap = new Map();
    for (const [key, value] of Object.entries(loadData)) {
      const parse = JSON.parse(value);
      loadMap.set(key, parse);
    }

    console.log(loadMap);
    setStore(loadMap);
  };

  const addSvgOnStore = (id, posInfo) => {
    const props = {
      ...posInfo,
      display: true,
    };
    setStore((prev) => new Map([...prev, [id, props]]));
  };

  const updateSvgOnStore = (id, display) => {
    const props = { ...store.get(id), display: display };

    setStore((prev) => new Map(prev).set(id, props));
  };

  // const updateWidthHeightOnStore = (id, widthHeight) => {
  //   const props = { ...store.get(id), ...widthHeight };
  //   console.log(id, props);
  //   setStore((prev) => new Map(prev).set(id, props));
  // };

  const setAdditionalProps = (id, handleObj) => {
    const props = { ...store.get(id), ...handleObj };

    setStore((prev) => new Map(prev).set(id, props));
  };

  useEffect(() => {
    const updatedLiveSvg = [];

    for (const [key, value] of store) {
      if (value.display) {
        const viewProps = {
          id: key,
          attachment: value,
        };
        updatedLiveSvg.push(viewProps);
      }
    }
    console.log("svgStore", updatedLiveSvg);
    // setLiveStore(updatedLiveSvg);

    const timer = () => setTimeout(() => setLiveStore(updatedLiveSvg), 5);
    const name = timer();

    return () => clearTimeout(name);
  }, [store]);

  return {
    addSvgOnStore,
    updateSvgOnStore,
    setAdditionalProps,
    // updateWidthHeightOnStore,
    liveStore,
    load,
  };
};
