export function parseCSV(fileInfo, successCallback, failureCallback) {
    var reader = new FileReader();
    reader.onload = () => {
        var csvString = reader.result;
        var csvArray = CSVToArray(csvString);
        // Validation
        if (csvArray[0][0] == "Title" && csvArray[0][1] == "Date")
            successCallback(csvArray);
        else {
            var msg = "File in the wrong format";
            failureCallback(msg);
        }
    };
    reader.readAsText(fileInfo);
}

// ref: https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
function CSVToArray(strData) {
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"), "gi");
    let arrMatches = null, arrData = [[]];
    while ((arrMatches = objPattern.exec(strData)) !== null) {
        if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ?
            arrMatches[2].replace(new RegExp("\"\"", "g"), "\"") :
            arrMatches[3]);
    }
    return arrData;
}