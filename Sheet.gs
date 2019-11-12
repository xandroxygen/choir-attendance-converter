function Sheet() {
  function getSheetByName(name) {
    return SpreadsheetApp.getActive().getSheetByName(name);
  }

  function netIdsSheet() {
    return getSheetByName(references().sheets.netIds);
  }

  function ipadOneSheet() {
    return getSheetByName(references().sheets.ipadOne);
  }

  function ipadTwoSheet() {
    return getSheetByName(references().sheets.ipadTwo);
  }

  function outputSheet() {
    return getSheetByName(references().sheets.output);
  }

  function instructionsSheet() {
    return getSheetByName(references().sheets.instructions);
  }

  return {
    netIdsSheet: netIdsSheet,
    ipadOneSheet: ipadOneSheet,
    ipadTwoSheet: ipadTwoSheet,
    outputSheet: outputSheet,
    instructionsSheet: instructionsSheet
  };
}

function references() {
  const inputPrefix = "Input | ";
  return {
    sheets: {
      instructions: "Instructions",
      netIds: inputPrefix + "NetIDs",
      ipadOne: inputPrefix + "iPad 1",
      ipadTwo: inputPrefix + "iPad 2",
      output: "Output | LS"
    },
    cells: {
      configNameOrder: "C10"
    }
  };
}
