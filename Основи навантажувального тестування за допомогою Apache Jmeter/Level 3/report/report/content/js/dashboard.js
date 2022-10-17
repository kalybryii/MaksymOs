/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.46666666666667, "KoPercent": 7.533333333333333};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9246666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9966666666666667, 500, 1500, "Delete"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "Post"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "Get"], "isController": false}, {"data": [0.9966666666666667, 500, 1500, "Patch"], "isController": false}, {"data": [0.9966666666666667, 500, 1500, "Put"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1500, 113, 7.533333333333333, 343.27733333333333, 10, 2358, 241.0, 271.9000000000001, 1975.8500000000001, 2302.95, 242.16984178237, 260.4580793913465, 51.08270100096868], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete", 300, 1, 0.3333333333333333, 247.25333333333325, 232, 1244, 242.0, 254.0, 259.0, 275.95000000000005, 84.26966292134831, 78.08988764044943, 18.5985779494382], "isController": false}, {"data": ["Post", 300, 10, 3.3333333333333335, 249.30999999999995, 232, 374, 243.0, 267.0, 284.95, 351.7900000000002, 106.04453870625663, 112.36785856309649, 25.268425238600212], "isController": false}, {"data": ["Get", 300, 100, 33.333333333333336, 728.7233333333329, 10, 2358, 47.5, 2220.3, 2302.75, 2341.96, 66.96428571428571, 83.27113560267857, 9.1552734375], "isController": false}, {"data": ["Patch", 300, 1, 0.3333333333333333, 245.07333333333324, 232, 313, 242.0, 258.0, 263.0, 293.97, 104.9317943336831, 127.27864583333333, 21.826633001049316], "isController": false}, {"data": ["Put", 300, 1, 0.3333333333333333, 246.02666666666656, 231, 342, 242.0, 260.0, 268.0, 294.98, 105.6710109193378, 98.78278828372666, 26.520947076435366], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,960 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,298 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,913 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,033 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,338 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,878 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,980 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,331 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,244 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,846 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,997 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,851 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,090 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,261 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,100 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,308 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,200 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,967 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,068 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,351 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,335 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,004 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 307 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,823 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,082 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,099 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,891 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,269 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,098 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,072 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,258 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,854 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,920 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,252 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,073 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,859 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,292 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 312 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,185 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,063 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,985 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,956 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,214 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 331 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,307 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,022 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,332 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,007 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 372 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,310 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,976 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,146 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,141 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,342 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,944 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, 2.6548672566371683, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,064 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,305 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,993 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 313 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,062 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,877 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,257 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,244 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,277 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 342 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,084 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,325 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 352 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,267 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 310 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,884 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,052 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,067 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,969 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,036 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,197 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,221 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 374 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,962 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,051 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,191 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,077 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,139 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,973 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,303 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,319 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,895 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,275 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,358 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,086 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, 1.7699115044247788, 0.13333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,329 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,188 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,856 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 1,949 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 315 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,031 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, 2.6548672566371683, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,124 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 305 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 0.8849557522123894, 0.06666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1500, 113, "The operation lasted too long: It took 1,944 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, "The operation lasted too long: It took 2,031 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, "The operation lasted too long: It took 2,298 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, "The operation lasted too long: It took 1,913 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, "The operation lasted too long: It took 2,244 milliseconds, but should not have lasted longer than 300 milliseconds.", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete", 300, 1, "The operation lasted too long: It took 1,244 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Post", 300, 10, "The operation lasted too long: It took 372 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 307 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 315 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 313 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 352 milliseconds, but should not have lasted longer than 300 milliseconds.", 1], "isController": false}, {"data": ["Get", 300, 100, "The operation lasted too long: It took 1,944 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, "The operation lasted too long: It took 2,031 milliseconds, but should not have lasted longer than 300 milliseconds.", 3, "The operation lasted too long: It took 2,298 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, "The operation lasted too long: It took 1,913 milliseconds, but should not have lasted longer than 300 milliseconds.", 2, "The operation lasted too long: It took 2,244 milliseconds, but should not have lasted longer than 300 milliseconds.", 2], "isController": false}, {"data": ["Patch", 300, 1, "The operation lasted too long: It took 313 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Put", 300, 1, "The operation lasted too long: It took 342 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
