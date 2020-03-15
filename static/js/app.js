// Step 1:  Read in json data, and create a list of test subject ids for the selection table
var select_ids = [];
d3.json("samples.json").then((data) => {
    // Get a list of subject ids
    select_ids = data.names;
    // console.log(select_ids);
    populateSelectIds();
}).catch(function(error) {
    console.log(error);
});

function populateSelectIds() {
    // Belly Button IDs
    var selectID = document.getElementById("selDataset");
    select_ids.forEach(function(selID) {
    //   console.log(selID);
      var myOption = document.createElement("option");
      myOption.text = selID;
      myOption.value = selID;
      selectID.add(myOption);
    });
};

function optionChanged() {
    var selectID = document.getElementById("selDataset").value;
    console.log("ID Selected:",  selectID);
   // Filter data for specific id
   var selected_meta = [];
   var selected_samples = [];

   function filterByID(person) {
    //return person.id == selected_meta;
    return person.id == selectID;
  };

    var url = "samples.json"

// Step 2:  Get demographic data for subject: id, ethnicity, gender, age, location, bellybutton type, and washing frequency
   d3.json(url).then((data) => {
        selected_meta = data.metadata;
        selected_samples = data.samples;
        var filtered_meta = selected_meta.filter(filterByID);
        var filtered_samples = selected_samples.filter(filterByID);
        //console.log(filtered_meta);
        console.log(filtered_meta[0].id, filtered_meta[0].ethnicity, filtered_meta[0].gender, filtered_meta[0].age, filtered_meta[0].location, filtered_meta[0].bbtype, filtered_meta[0].wfreq);
        console.log(filtered_samples);
        // create array to hold metadata to display
        var meta_array = [];
        meta_array.push(`ID: ${filtered_meta[0].id}`);
        meta_array.push(`Ethnicity: ${filtered_meta[0].ethnicity}`);
        meta_array.push(`Gender: ${filtered_meta[0].gender}`);
        meta_array.push(`Age: ${filtered_meta[0].age}`);
        meta_array.push(`Location: ${filtered_meta[0].location}`);
        meta_array.push(`BBType:  ${filtered_meta[0].bbtype}`);
        meta_array.push(`W Freq: ${filtered_meta[0].wfreq}`);

        // populate demographic panel with info
        var meta_section = document.querySelector("#sample-metadata");
        meta_section.innerHTML = '';
        meta_array.forEach(function(x){
        var textnode = document.createTextNode(x);
        meta_section.appendChild(textnode);
        linebreak = document.createElement("br");
        meta_section.appendChild(linebreak);
        }); 

    // ==============================================================================================    
    // Step 3:  Create a horizontal bar chart for frequency of various OTUs
        var otu_ids = filtered_samples[0].otu_ids;
        var sample_values = filtered_samples[0].sample_values;
        var otu_labels = filtered_samples[0].otu_labels;
    
        var max_slice = (otu_ids.length < 10 ? otu_ids.length : 10);
        otu_ids = otu_ids.slice(0,max_slice);
        otu_id_names = [];
        otu_ids.forEach(function(x){
            var bar_name = "OTU " + String(x);
            otu_id_names.push(bar_name);
        })

        // Sample values are ordered highest quantity to lowest, so get the 1st 10 values to plot
        sample_values = sample_values.slice(0,max_slice);
        otu_labels = otu_labels.slice(0,max_slice);

        // console.log(otu_ids);
        // console.log(sample_values);
        // console.log(otu_labels);

        var hbar_div = document.getElementById("#bar");
        var data = [{
            type: 'bar',
            x: sample_values,
            y: otu_id_names,
            text: otu_labels,
            orientation: 'h'
          }];

        var layout = {
            title: `Quantity of OTUs for Subject ID# ${selectID}`,
            yaxis:{autorange:'reversed'}
        };  

        Plotly.newPlot('bar', data, layout);
    // ==============================================================================================    
    // Step 4:  Create a bubble chart showing the amount (y-axis) of a specific OTU # (x-axis)
        var bubble_div = document.getElementById("#bubble");

        var trace1 = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
              size: sample_values,
              color: ['lightblue', 'blue', 'green', 'lightgreen','red', 'orange', 'purple', 'brown', 'yellow', 'pink']
            }
          };
          
          var data = [trace1];
          
          var layout = {
            title: 'Bacteria Quantity per OTU ID',
            showlegend: false,
            height: 600,
            width: 600
          };
          
          Plotly.newPlot('bubble', data, layout);

    // ==============================================================================================              
    // Step 5:  Create a gauge with arrow pointing to belly button washing frequency

          var gauge_div = document.getElementById("#gauge");
          var data = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: filtered_meta[0].wfreq,
              title: `<b>Belly Button Washing Frequency</b> <br> Scrubs per Week`,
              type: "indicator",
              mode: "gauge+number",
              gauge: {
                axis: { range: [null, 9] },
                steps: [
                  { range: [0, 1], color: "#a83232" },
                  { range: [1, 2], color: "#a85732" },
                  { range: [2, 3], color: "#a87132" },
                  { range: [3, 4], color: "#a87932" },
                  { range: [4, 5], color: "#a89432" },
                  { range: [5, 6], color: "#9aa832" },
                  { range: [6, 7], color: "#7da832" },
                  { range: [7, 8], color: "#57a832" },
                  { range: [8, 9], color: "#32a848" },
                ]
              },  
              "labels": ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
              "textinfo": 'text',
              "textposition":'inside',
            }
          ];
          
        var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
        Plotly.newPlot('gauge', data, layout);

    });
};    
