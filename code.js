"use strict";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

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
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "find") {
    const instances = figma.root.findAllWithCriteria({
      types: ["INSTANCE"],
    });

    const components = figma.root.findAllWithCriteria({
      types: ["COMPONENT"],
    });

    const stack = [];
    instances.forEach((instance) => {
      const found = components.find((c) => {
        return c.id === instance.mainComponent.id;
      });

      //console.log("found instance?", instance.id, found);

      if (instance.mainComponent === null) {
        console.log("isNull", instance.name);
      }
      if (instance.mainComponent === undefined) {
        console.log("isUndefined", instance.name);
      }

      if (found === undefined) {
        /* const inStack = stack.find((c) => {
          return c.mainComponent.id === instance.mainComponent.id;
        }); */

        // if the mainComponent has no parent it is a missing component
        if (!instance.mainComponent.parent) {
          stack.push(instance);
        }
        // if (inStack === undefined) {
        //   stack.push(instance);
        // }
      }
    });

    const preparedStack = stack.map((node) => {
      return {
        id: node.id,
        name: node.name,
      };
    });

    figma.ui.postMessage({ nodes: preparedStack });
    // figma.currentPage.selection = nodes;
    // figma.viewport.scrollAndZoomIntoView(nodes);
  }

  if (msg.type === "getNode") {
    const node = figma.getNodeById(msg.id);

    const page = getPage(node);

    figma.currentPage = page;
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
