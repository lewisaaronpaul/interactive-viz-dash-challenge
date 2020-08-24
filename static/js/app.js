// Use D3 fetch to read the JSON file
// The data from the JSON file is arbitrarily named importedData as the argument
let importedData;
d3.json("./data/samples.json").then(importedData => {
    let theData = importedData;
    console.log(`theData`);
    console.log(theData);
    // Grab values from the data json object to build the plots
    // ID of each subject
    const subjectsIds = theData.names;
    console.log(`subjectsIds`);
    console.log(subjectsIds);

    const samples = theData.samples;
    console.log(`samples`);
    console.log(samples);

    const metadata = theData.metadata;
    console.log(`metadata`);
    console.log(metadata);

    // ======= Dropdown options =======

    // =================================================================
    //       Set up the HTML dropdown QUERY SECTION dynamically
    // =================================================================

    // Create the dropdown choices
    let select = d3.select("#selDataset");
        
    select.selectAll("option")
        .data(subjectsIds)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    
    // ======= End of dropdown options =======

    let arrayForSamples = subjectsIds.map((subjectID, index) => {
        let otu_ids = samples[index].otu_ids;
        // console.log(`otu_ids`);
        // console.log(otu_ids);

        let otu_labels = samples[index].otu_labels;
        // console.log(`otu_labels`);
        // console.log(otu_labels);

        let sample_values = samples[index].sample_values;
        // console.log(`sample_values`);
        // console.log(sample_values);

        return {
            subject_id: subjectID,
            objectForPlotting: otu_ids.map((otu_id, index) => {
                return {
                    otu_id: otu_id,
                    otu_label: otu_labels[index],
                    sample_value: sample_values[index],
                    barLabel: `${otu_id}: ${otu_labels[index].split(";").slice(-1)} `,
                    family: otu_labels[index].split(";").slice(0, 5).join(),
                    genus: otu_labels[index].split(";").slice(-1)[0]        
                };
            }),
            metadata: metadata[index]
        };
    });

    console.log(`arrayForSamples`);
    console.log(arrayForSamples);

    // ===========================================================
    // Function to generate the Bar Plot of each subject
    // ===========================================================
    function barGen (selectedSubjectId) {
        let subjectId = selectedSubjectId;
        // Get the index of a particular subject ID. Example:940
        let selectedSubjectIndex = subjectsIds.indexOf(subjectId);

        let metadataForSample = metadata[selectedSubjectIndex];
        console.log(`Metadata ID: ${subjectId}`);
        console.log(metadataForSample);

        // Using a for/in loop: loops through the properties of an Object
        for (theKeys in metadataForSample) {
            d3.select("#sample-metadata")
                .append("p")
                .text(`${theKeys.toUpperCase()}: ${metadataForSample[theKeys]}`)
                .style("font-weight", "bold"); 
          };

        let arrayForSample = arrayForSamples[selectedSubjectIndex].objectForPlotting;
        console.log(`Sample ID: ${subjectId}`);
        console.log(arrayForSample);

        // Sort arrayForSample in decreasing order by sample_value
        let sortedArrayForSample = arrayForSample.sort((a, b) => b.sample_value - a.sample_value);
        console.log(`Sorted array for sample ${subjectId}`);
        console.log(sortedArrayForSample);

        // Get the top ten and reverse
        let topTen = sortedArrayForSample.slice(0, 10).reverse();
        console.log(`TopTen`);
        console.log(topTen);

        // Trace for the selected subject Data
        let trace = {
            x: topTen.map(d => d.sample_value),
            y: topTen.map(d => d.barLabel),
            text: topTen.map(d => d.otu_label),
            name: "microbes",
            type: "bar",
            marker: {
                color: '#F37F0B'
            },
            orientation: "h"
        };

        //  the data
        let data = [trace];

        // Apply the group bar mode to the layout
        var layout = {
            title: `<b>Top Ten Bacteria - Subject ${subjectId}</b>`,
            font: {size: 14},
            autosize: true,
            showlegend: false,
            xaxis: { title: `<b>Microbes Count</b>` },
            yaxis: {
              tickmode: 'array',
              automargin: true
            //   titlefont: { size:30 },
            },
            paper_bgcolor: '#F1F17C',
            plot_bgcolor: '#FEF8DF'
          };
        
        // Render the plot to the div tag with id "bar1"; add config for responsiveness
        var config = {responsive: true}
        Plotly.newPlot("bar1", data, layout, config);  
    };
    
    let theSubjectId = "940";
    barGen(theSubjectId);

    // =========== Handling dropdown selection =============

    // Function to handle input change
    function handleChange(event) {
        // Remove any previous <p>
        d3.select("#sample-metadata").selectAll("p").remove();

        // grab the value of the selection
        var inputText = d3.event.target.value;
        
        barGen(inputText);
        bubbleGen(inputText);
    }
  
    select.on("change", handleChange);

    // ============ End of handling dropdown selection ============

    // ==========================================================
    //                  Aggregation
    // ==========================================================
    let allOtu_ids = samples.map(sample => sample.otu_ids);
    console.log(`allOtu_ids`);
    console.log(allOtu_ids);

    let allOtu_labels = samples.map(sample => sample.otu_labels);
    console.log(`allOtu_labels`);
    console.log(allOtu_labels);

    let allSample_values = samples.map(sample => sample.sample_values);
    console.log(`allSample_values`);
    console.log(allSample_values);

    let allSubjectId = samples.map(sample => sample.id);
    console.log(`allSubjectId`);
    console.log(allSubjectId);

    // Create an array of object for each family and corresponding value
    allFamiliesArray = [];
    allOtu_labels.forEach((value, index) => {
        let itemLabelArray = value;
        let itemSampleValueArray = allSample_values[index];
        let itemOtu_idArray = allOtu_ids[index];
        let theSubject_id = allSubjectId[index]
        itemLabelArray.forEach((label, index) => {
            let familyObject = {
                otu_label: label,
                subject_id: theSubject_id,
                family: label.split(";").slice(0, 5).join(),
                genus: label.split(";").slice(-1)[0],
                otu_ids: itemOtu_idArray[index],
                barLabel: `${itemOtu_idArray[index]}: ${label.split(";").slice(-1)[0]} `,
                theValue: itemSampleValueArray[index]
            };
            allFamiliesArray.push(familyObject);
        });
    });
    console.log(`allFamiliesArray`);
    console.log(allFamiliesArray);

    // Identify the unique genus
    const uniqueFamiliesGenus = [...new Set([].concat(...allFamiliesArray.map((obj) => obj.barLabel)))].sort((a, b) => b - a);
    console.log(`uniqueFamiliesGenus`);
    console.log(uniqueFamiliesGenus);

    // Filter and reduce for each unique genus
    let totalGenusArray = uniqueFamiliesGenus.map(eachGenus => {
        let workingObjectArray = allFamiliesArray.filter(family => family.barLabel === eachGenus);
        let firstItem = workingObjectArray[0];
        return {
            otu_label: firstItem.otu_label,
            genus: eachGenus,
            total: allFamiliesArray.filter(family => family.barLabel === eachGenus)
                                   .reduce((total, family) => total + family.theValue, 0)
        };
    });
    console.log(`totalGenusArray`);
    console.log(totalGenusArray);

    // Sort totalGenusArray in decreasing order by total
    let sortedTotalGenusArray = totalGenusArray.sort((a, b) => b.total - a.total);
    console.log(`sortedTotalGenusArray`);
    console.log(sortedTotalGenusArray);

    // Get the top ten and reverse
    let topTenTotalGenus = sortedTotalGenusArray.slice(0, 10).reverse();
    console.log(`topTenTotalGenus`);
    console.log(topTenTotalGenus);

    // Trace for the top 10 total Data
    let traceTotal = {
        x: topTenTotalGenus.map(d => d.total),
        y: topTenTotalGenus.map(d => d.genus),
        text: topTenTotalGenus.map(d => d.otu_label),
        name: "agg_microbes",
        type: "bar",
        marker: {
            color: '#F37F0B'
        },
        orientation: "h"
    };

    //  the data
    let dataTotal = [traceTotal];

    // Apply the layout
    var layoutTotal = {
        title: `<b>Top Ten Bacteria - All Subject</b>`,
        font: {size: 14},
        autosize: true,
        showlegend: false,
        xaxis: { title: `<b>Microbes Count</b>` },
        yaxis: {
          tickmode: 'array',
          automargin: true
        },
        paper_bgcolor: '#F1F17C',
        plot_bgcolor: '#FEF8DF'
    };
     
    // Render the plot to the div tag with id "bar2", add config for responsiveness
    var config = {responsive: true}
    Plotly.newPlot("bar2", dataTotal, layoutTotal, config);  

    // ============ End of Aggregation ============

    // ============ Bubble Chart ============

    function bubbleGen (selectedSubjectId) {
        let mySampleId = selectedSubjectId;

        // Extract the data for mySample
        let mySampleData = allFamiliesArray.filter(objInfo => objInfo.subject_id === mySampleId);
        console.log(`mySampleData: ${mySampleId}`);
        console.log(mySampleData);

        // Now let's identify the unique array of families in this sample
        const uniqueFamiliesMySample = [...new Set([].concat(...mySampleData.map((obj) => obj.family)))];
        console.log(`uniqueFamiliesMySample`);
        console.log(uniqueFamiliesMySample);
   
        // Filter and reduce for each unique family
        let totalSampleFamily = uniqueFamiliesMySample.map(eachFamily => {
            return {
                family: eachFamily,
                total: mySampleData.filter(d => d.family === eachFamily)
                                    .reduce((total, d) => total + d.theValue, 0)
            };
        });
        console.log(`totalSampleFamily`);
        console.log(totalSampleFamily);
        
        // Sort totalSampleFamily in ascending order by total
        let sortedtotalSampleFamily = totalSampleFamily.sort((a, b) => b.total - a.total);
        console.log(`sortedtotalSampleFamily`);
        console.log(sortedtotalSampleFamily);
        let xValues = sortedtotalSampleFamily.map(d => d.total);
        console.log(`xValues`);
        console.log(xValues);

        let max_xValues = d3.max(xValues);
        console.log(`max_xValues`);
        console.log(max_xValues);

        let yValues = sortedtotalSampleFamily.map(d => d.family);
    
        // Let use bubble size scaling for Bubble Charts
        //Set 'sizeref' to an 'ideal' size given by the formula 
        // sizeref = 2. * max(array_of_size_values) / (desired_maximum_marker_size ** 2)
        let desired_maximum_marker_size = 50;
        let size = sortedtotalSampleFamily.map(d => d.total);
        let traceBubble = {
            x: xValues,
            y: yValues,
            mode: 'markers',
            marker: {
            color: '#F37F0B',
            size: size,
            sizeref: 2.0 * Math.max(...size) / (desired_maximum_marker_size**2),
            sizemode: "area"
            }
        };
        
        let dataBubble = [traceBubble];
        
        var layoutBubble = {
            title: `<b>Count of Bacteria by Family - Subject: ${mySampleId}</b>`,
            font: {size: 14},
            autosize: true,
            height: 600,
            showlegend: false,
            xaxis: { title: `<b>Microbes Count</b>` },
            yaxis: {
              tickmode: 'array',
              automargin: true
            },
            paper_bgcolor: '#F1F17C',
            plot_bgcolor: '#FEF8DF'
        };

        // Render the bubble plot; add config for responsiveness
        var config = {responsive: true}
        Plotly.newPlot('bubble', dataBubble, layoutBubble, config);
    };

    bubbleGen(theSubjectId);

});
