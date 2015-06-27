(function() {

// some data
var data  =  [{count: 46258, name: "1", fill: "#d1e0f3"},
			  {count: 13267, name: "2"      , fill: "#d1e0f3"},
			  {count: 7568, name: "3"     , fill: "#d1e0f3"},
			  {count: 3555, name: "4"       , fill: "#d1e0f3"},
			  {count: 1677, name: "5"    , fill: "#d1e0f3"},
			  {count: 719, name: "6"       , fill: "#d1e0f3"},  
			  {count: 275, name: "7"    , fill: "#d1e0f3"},
			  {count: 98, name: "8"    , fill: "#d1e0f3"},
			  {count: 19, name: "9"    , fill: "#d1e0f3"},
			  {count: 10, name: "10"    , fill: "#d1e0f3"},
			  {count: 2, name: "11"    , fill: "#d1e0f3"},
			  {count: 2, name: "13"    , fill: "#d1e0f3"},
			  ];

var topColor    = "black", 
    bottomColor = "black";
			  
// chart dimensions	
var width       = 1600,
    height      = 500;

var padding     = 4, // collision padding
    maxRadius   = 200; // collision search radius

var r = d3.scale.sqrt()
		  .domain([0, d3.max(data,function(d){return d.count;})])
		  .range([0, maxRadius]);

var force = d3.layout.force()
    .gravity(0)
    .charge(0)
    .size([width, height])
    .on("tick", tick);

var node  = d3.select(".g-nodes").selectAll(".g-node"),
    label = d3.select(".g-labels").selectAll(".g-label");

Update(data);

// Update the known topics.
function Update(data) {
  data.forEach(function(d,i){d.r = Math.max(12, r(d.count));}); // min. collision
  force.nodes(data).start();
  updateNodes();
  updateLabels();
}

// Update the displayed nodes.
function updateNodes() {
  node = node.data(data, function(d) { return d.name; });

  node.exit().remove();

  node.enter().append("a")
      .attr("class", "g-node")
      .call(force.drag)
    .append("circle");

  node.select("circle")
      .attr("r", function(d) { return 0; })
	  .transition()
	  .duration(1000)
      .attr("r", function(d) { return r(d.count); })
	  .style("fill", function(d) { return d.fill; });
}

// Update the displayed node labels.
function updateLabels() {
  label = label.data(data, function(d) { return d.name; });

  label.exit().remove();

  var labelEnter = label.enter().append("a")
      .attr("class", "g-label")
      .call(force.drag);

  labelEnter.append("div")
      .attr("class", "g-name")
      .text(function(d) { return d.name; });

  labelEnter.append("div")
      .attr("class", "g-value");
 
  // top label
  label
      .style("font-size", function(d) { 
		var Size = Math.max(8, r(d.count) / 2) + "px"; 
		return Size})
	  .style("color",topColor)
      .style("width", function(d) { return r(d.count) * 2.5 + "px"; });

  // Create a temporary span to compute the true text width.
  // https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect
  label.append("span")
      .text(function(d) { return d.name; })
	  .each(function(d) { d.dx = Math.max(2.5 * r(d.count), this.getBoundingClientRect().width); })
      .remove();

  // bottom label
  label
      .style("width", function(d) { return d.dx + "px"; })
    .select(".g-value")
	      .style("color",bottomColor)
      .text(function(d) { return d.count + (d.r > 60 ? " hits" : ""); });

  // Compute the height of labels when wrapped.
  label.each(function(d) { 
   var Height = this.getBoundingClientRect().height;
   d.dy = Height });
}

// Simulate forces and update node and label positions on tick.
function tick(e) {
  node
      .each(gravity(e.alpha * .1))
      .each(collide(.5))
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  label
      .style("left", function(d) { return (d.x - d.dx / 2) + "px"; })
      .style("top", function(d) { return (d.y - d.dy / 2) + "px"; });
}

// Custom gravity to favor a non-square aspect ratio.
function gravity(alpha) {
  var cx = width / 2,
      cy = height / 2,
      ax = alpha / 4,
      ay = alpha;
  return function(d) {
    d.x += (cx - d.x) * ax;
    d.y += (cy - d.y) * ay;
  };
}

// Resolve collisions between nodes.
function collide(alpha) {
  var q = d3.geom.quadtree(data);
  return function(d) {
    var r = d.r + maxRadius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    q.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d) && d.other !== quad.point && d !== quad.point.other) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.r + quad.point.r + padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

// Fisher–Yates shuffle.
function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}
})();