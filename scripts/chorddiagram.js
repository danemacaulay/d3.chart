window.chord = function(options) {

  options = options || {};

  var width = options.width || 960,
      height = options.height || 500,
      innerRadius = Math.min(width, height) * .41,
      outerRadius = innerRadius * 1.1;

  var fill = d3.scale.ordinal()
      .domain(d3.range(4))
      .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // This object serves as a namespace for this diagram's layers
  var layers = {};

  layers.handles = function(chord) {

    function onEnter() {
      this.style("fill", function(d) { return fill(d.index); })
          .style("stroke", function(d) { return fill(d.index); })
          .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
          .on("mouseover", fade(.1))
          .on("mouseout", fade(1));
    }

    var handles = svg.append("g").selectAll("path")
        .data(chord.groups);
    var enteringHandles = handles.enter().append("path");

    enteringHandles.call(onEnter);
  };

  layers.ticks = function(chord) {

    function onEnter() {
      this.attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + outerRadius + ",0)";
          });
      this.append("line")
          .attr("x1", 1)
          .attr("y1", 0)
          .attr("x2", 5)
          .attr("y2", 0)
          .style("stroke", "#000");

      this.append("text")
          .attr("x", 8)
          .attr("dy", ".35em")
          .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
          .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
          .text(function(d) { return d.label; });
    }

    var ticks = svg.append("g").selectAll("g")
        .data(chord.groups)
      .enter().append("g").selectAll("g")
        .data(groupTicks);
    var enteringTicks = ticks.enter().append("g");

    enteringTicks.call(onEnter);
  };

  layers.chords = function(chord) {
    function onEnterChords() {
      this.attr("d", d3.svg.chord().radius(innerRadius))
          .style("fill", function(d) { return fill(d.target.index); })
          .style("opacity", 1);
    }
    var chords = svg.append("g")
        .attr("class", "chord")
      .selectAll("path")
        .data(chord.chords);
    var enteringChords = chords.enter().append("path");

    enteringChords.call(onEnterChords);
  };

  function chord(matrix) {

    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .matrix(matrix);

    layers.handles(chord);
    layers.ticks(chord);
    layers.chords(chord);
  };

  // Returns an array of tick angles and labels, given a group.
  function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1000).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 5 ? null : v / 1000 + "k"
      };
    });
  }

  // Returns an event handler for fading a given chord group.
  function fade(opacity) {
    return function(g, i) {
      svg.selectAll(".chord path")
          .filter(function(d) { return d.source.index != i && d.target.index != i; })
        .transition()
          .style("opacity", opacity);
    };
  }

  return chord;

};