import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataParse } from "../dataParse";

/**
 * Reusable Candle Stick Component
 *
 */
export default function() {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 400;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = ["green", "red"];
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var xScale;
  var yScale;
  var colorScale = d3.scaleOrdinal().range(colors).domain([true, false]);
  var candleWidth = 3;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = (typeof colorScale === 'undefined') ?
      d3.scaleOrdinal().range(colors).domain(categoryNames) :
      colorScale;
  }

  /**
   * Constructor
   */
  var my = function(selection) {
    // Is Up Day
    var isUpDay = function(d) {
      return d.close > d.open;
    };

    // Is Down Day
    var isDownDay = function(d) {
      return !isUpDay(d);
    };

    // Line Function
    var line = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

    // High Low Lines
    var highLowLines = function(bars) {
      var paths = bars.selectAll('.high-low-line')
        .data(function(d) { return [d]; });

      paths.enter()
        .append('path')
        .classed('high-low-line', true)
        .attr('d', function(d) {
          return line([
            { x: xScale(d.date), y: yScale(d.high) },
            { x: xScale(d.date), y: yScale(d.low) }
          ]);
        });
    };

    // Open Close Bars
    var openCloseBars = function(bars) {
      var rect = bars.selectAll('.open-close-bar')
        .data(function(d) { return [d]; });

      rect.enter()
        .append('rect')
        .classed('open-close-bar', true)
        .attr('x', function(d) {
          return xScale(d.date) - candleWidth;
        })
        .attr('y', function(d) {
          return isUpDay(d) ? yScale(d.close) : yScale(d.open);
        })
        .attr('width', candleWidth * 2)
        .attr('height', function(d) {
          return isUpDay(d) ?
            yScale(d.open) - yScale(d.close) :
            yScale(d.close) - yScale(d.open);
        });
    };

    // Open Close Ticks
    var openCloseTicks = function(bars) {
      var open = bars.selectAll('.open-tick')
        .data(function(d) { return [d]; });

      var close = bars.selectAll('.close-tick')
        .data(function(d) { return [d]; });

      open.enter()
        .append('path')
        .classed('open-tick', true)
        .attr('d', function(d) {
          return line([
            { x: xScale(d.date) - candleWidth, y: yScale(d.open) },
            { x: xScale(d.date), y: yScale(d.open) }
          ]);
        });

      close.enter()
        .append('path')
        .classed('close-tick', true)
        .attr('d', function(d) {
          return line([
            { x: xScale(d.date), y: yScale(d.close) },
            { x: xScale(d.date) + candleWidth, y: yScale(d.close) }
          ]);
        });
    };

    selection.each(function(data) {
      init(data);

      // Create series group
      var seriesSelect = d3.select(this).selectAll('.series')
        .data(function(d) { return [d]; });

      var series = seriesSelect.enter()
        .append("g")
        .classed("series", true)
        .on("mouseover", function(d) { dispatch.call("customSeriesMouseOver", this, d); })
        .on("click", function(d) { dispatch.call("customSeriesClick", this, d); })
        .merge(seriesSelect);

      // Add bars to series
      var barsSelect = series.selectAll(".bar")
        .data(function(d) { return d.values; });

      var bars = barsSelect.enter()
        .append("g")
        .classed("bar", true)
        .attr("fill", function(d) { return colorScale(isUpDay(d)); })
        .attr("stroke", function(d) { return colorScale(isUpDay(d)); })
        .on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d); })
        .on("click", function(d) { dispatch.call("customValueClick", this, d); })
        .merge(barsSelect);

      highLowLines(bars);
      openCloseBars(bars);
      // openCloseTicks(bars);

      bars.exit().remove();
    });
  };

  /**
   * Configuration Getters & Setters
   */
  my.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function(_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.candleWidth = function(_) {
    if (!arguments.length) return candleWidth;
    candleWidth = _;
    return my;
  };

  my.dispatch = function(_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function() {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
};
