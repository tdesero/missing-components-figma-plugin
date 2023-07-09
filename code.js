"use strict";

figma.showUI(__html__);

function getPage(nd) {
  if (nd.type.toString() === "PAGE") {
    return nd;
  }
  if (!nd.parent) {
    return nd;
  }
  return getPage(nd.parent);
}

function getRoot(nd) {
  if (nd.type.toString() === "DOCUMENT") {
    return nd;
  }
  if (!nd.parent) {
    return nd;
  }
  return getRoot(nd.parent);
}

figma.skipInvisibleInstanceChildren = true;
figma.ui.onmessage = (msg) => {
  const start = Date.now();

  if (msg.type === "find") {
    const instances = figma.root.findAllWithCriteria({
      types: ["INSTANCE"],
    });

    const components = figma.root.findAllWithCriteria({
      types: ["COMPONENT"],
    });

    const simplifiedInstances = instances.map((c) => {
      return {
        name: c.name,
        id: c.id,
        mainComponent: c.mainComponent,
      };
    });

    const simplifiedComponents = components.map((c) => {
      return {
        name: c.name,
        id: c.id,
        mainComponent: c.mainComponent,
      };
    });

    const missingComponents = simplifiedInstances
      .map((instance) => {
        const found = simplifiedComponents.find((c) => {
          return c.id === instance.mainComponent.id;
        });

        if (found === undefined) {
          // if the mainComponent has not remote it is a missing/removed component
          if (!instance.mainComponent.remote) {
            return instance;
          }
        }
      })
      .filter((i) => i); // remove unused

    const preparedStack = missingComponents.map((node) => {
      return {
        id: node.id,
        name: node.name,
      };
    });

    const end = Date.now();
    console.log("operation took: " + (end - start) + "ms");

    figma.ui.postMessage({ nodes: preparedStack });
  }

  if (msg.type === "getNode") {
    const node = figma.getNodeById(msg.id);

    const page = getPage(node);

    figma.currentPage = page;
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
};
