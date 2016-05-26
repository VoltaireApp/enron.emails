var fs = require('fs');
var graph = require('ngraph.graph')({ uniqueLinkId: false });

var fileName = process.argv[2];
if (!fileName) {
  console.log('Usage: ');
  console.log('  node index.js path_to_masterNodeList.tsv');
  process.exit(1);
  return;
}

var readline = require('readline');
var hasHeader = true;

var lineReader = readline.createInterface({
  input: fs.createReadStream(fileName)
});
var count = 0;

lineReader.on('line', function (line) {
  if (hasHeader) {
    hasHeader = false;
    // skip the first line
    return;
  }
  var parts = line.split('\t');
  var fromId = parts[0];
  for (var i = 1; i < parts.length; i += 2) {
    // starting from the first node, every other node is a "to id"
    graph.addLink(fromId, parts[i])
  }
  count++;
});

lineReader.on('close', function() {
  console.log('Finished reading graph');
  console.log('Nodes count: ', graph.getNodesCount());
  console.log('Edges count: ', graph.getLinksCount());
  console.log('');
  console.log('Saving graph to ./data folder...');

  var save = require('ngraph.tobinary');
  save(graph, { outDir: './data' });

  console.log('Done. Starting layout');
  var createLayout = require('ngraph.offline.layout');

  var layout = createLayout(graph);
  console.log('Starting layout');
  layout.run();
  console.log('All done. You can now copy ./data/links.bin, ./data/positions.bin and data/labels.json into galactic data folder');
});
