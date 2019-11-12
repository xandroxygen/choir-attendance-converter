function transform() {
  const SheetFactory = Sheet();

  // get all provided input
  const netIdsData = SheetFactory.netIdsSheet()
    .getDataRange()
    .getValues();
  const ipadOneData = SheetFactory.ipadOneSheet()
    .getDataRange()
    .getValues();
  const ipadTwoData = SheetFactory.ipadTwoSheet()
    .getDataRange()
    .getValues();
  const nameOrderData = SheetFactory.instructionsSheet()
    .getRange(references().cells.configNameOrder)
    .getValue();

  // remove header row
  netIdsData.shift();

  // remove last 4 columns, which are unneeded totals
  const headerRow = ipadOneData.shift().slice(0, -4);

  // remove header row for concatenation, and last 4 columns
  ipadTwoData.shift();
  const ipadData = ipadOneData.concat(ipadTwoData).map(function(row) {
    return row.slice(0, -4);
  });

  // associate names to netIDs
  const nameToNetId = netIdsData.reduce(function(
    ret,
    [lastName, firstName, netId]
  ) {
    ret[firstName + " " + lastName] = netId;
    return ret;
  },
  {});

  // convert dates in header row to LS format
  const outputHeaderRow = headerRow.map(function(value) {
    if (value === "") {
      return value;
    }

    try {
      // date string should be `day (d)d/mm/yy, time`
      // strip off day from front
      const valueWithoutDay = value.split(" ")[1];
      // strip off time from back
      const valueWithoutTime = valueWithoutDay.split(",")[0];
      // split into d/m/y
      const [day, month, year] = valueWithoutTime.split("/");

      if (!day || !month || !year) {
        throw new Error();
      }

      const paddedDay = day < 10 ? "0" + day : day;
      const paddedMonth = month < 10 ? "0" + month : month;

      return [paddedDay, paddedMonth, year].join("/");
    } catch (e) {
      throw new Error("An iPad header date is misformatted.");
    }
  });

  // convert attendance records from iPad format to LS format
  const failedAssociations = [];
  const outputData = ipadData.map(function(row) {
    const name =
      nameOrderData === "First Name"
        ? row[0] + " " + row[1]
        : row[1] + " " + row[0];

    const netId = nameToNetId[name];
    if (!netId) {
      failedAssociations.push(name);
    }

    const outputRecords = row.slice(2).map(function(record) {
      switch (record) {
        case "Present":
        case "Late":
          return 1;
        case "Excused":
          return "x";
        case "Absent":
          return 0;
        default:
          throw new Error(
            "Encountered invalid attendance value '" + record + "' in iPad data"
          );
      }
    });

    return [netId || "FIX " + name].concat(outputRecords);
  });

  // remove first column frome header, because
  // data columns combined first and last name
  // into one column for netid
  outputHeaderRow.shift();

  const values = [outputHeaderRow].concat(outputData);
  SheetFactory.outputSheet()
    .getRange(1, 1, values.length, outputHeaderRow.length)
    .setValues(values);

  // notify the user of failures
  if (failedAssociations.length > 0)
    SpreadsheetApp.getUi().alert(
      "These names weren't matched to NetIDs:\n" +
        failedAssociations.join("\n") +
        "\nFind the correct NetID and fix before uploading to LS."
    );
}

function reset() {
  const SheetFactory = Sheet();
  SheetFactory.outputSheet().clear();
  SheetFactory.netIdsSheet().clear();
  SheetFactory.ipadOneSheet().clear();
  SheetFactory.ipadTwoSheet().clear();
}

function onOpenTrigger() {
  const spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.addMenu("Actions", [
    { name: "Transform", functionName: "transform" },
    {
      name: "Start over",
      functionName: "reset"
    }
  ]);
}
