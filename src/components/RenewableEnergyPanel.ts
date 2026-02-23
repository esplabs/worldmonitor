/**
 * RenewableEnergyPanel -- displays a D3 arc gauge showing global renewable
 * electricity percentage, a historical trend sparkline, and a regional
 * breakdown with horizontal bars.
 *
 * Extends Panel base class. Uses theme-aware colors via getCSSColor().
 */

import { Panel } from './Panel';
import * as d3 from 'd3';
import type { RenewableEnergyData, RegionRenewableData } from '@/services/renewable-energy-data';
import { getCSSColor } from '@/utils';
import { replaceChildren } from '@/utils/dom-utils';

export class RenewableEnergyPanel extends Panel {
  constructor() {
    super({ id: 'renewable', title: 'Renewable Energy', trackActivity: false });
  }

  /**
   * Set data and render the full panel: gauge + sparkline + regional breakdown.
   */
  public setData(data: RenewableEnergyData): void {
    replaceChildren(this.content);

    // Empty state
    if (data.globalPercentage === 0 && data.regions.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'renewable-empty';
      Object.assign(empty.style, {
        padding: '24px 16px',
        color: 'var(--text-dim)',
        textAlign: 'center',
        fontSize: '13px',
      });
      empty.textContent = 'No renewable energy data available';
      this.content.appendChild(empty);
      return;
    }

    const container = document.createElement('div');
    container.className = 'renewable-container';
    Object.assign(container.style, {
      padding: '8px',
    });

    // Section 1: Gauge
    const gaugeSection = document.createElement('div');
    gaugeSection.className = 'renewable-gauge-section';
    Object.assign(gaugeSection.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '12px',
    });
    this.renderGauge(gaugeSection, data.globalPercentage, data.globalYear);
    container.appendChild(gaugeSection);

    // Historical sparkline (bonus below gauge)
    if (data.historicalData.length > 2) {
      const sparkSection = document.createElement('div');
      sparkSection.className = 'renewable-sparkline-section';
      Object.assign(sparkSection.style, {
        marginBottom: '12px',
      });
      this.renderSparkline(sparkSection, data.historicalData);
      container.appendChild(sparkSection);
    }

    // Section 2: Regional Breakdown
    if (data.regions.length > 0) {
      const regionsSection = document.createElement('div');
      regionsSection.className = 'renewable-regions';
      this.renderRegions(regionsSection, data.regions);
      container.appendChild(regionsSection);
    }

    this.content.appendChild(container);
  }

  /**
   * Render the animated D3 arc gauge showing global renewable electricity %.
   */
  private renderGauge(
    container: HTMLElement,
    percentage: number,
    year: number,
  ): void {
    const size = 140;
    const radius = size / 2;
    const innerRadius = radius * 0.7;
    const outerRadius = radius;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('width', size)
      .attr('height', size)
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${radius},${radius})`);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(4)
      .startAngle(0);

    // Background arc (full circle) -- theme-aware track color
    g.append('path')
      .datum({ endAngle: Math.PI * 2 })
      .attr('d', arc as any)
      .attr('fill', getCSSColor('--border'));

    // Foreground arc (renewable %) -- animated from 0 to target
    const targetAngle = (percentage / 100) * Math.PI * 2;
    const foreground = g.append('path')
      .datum({ endAngle: 0 })
      .attr('d', arc as any)
      .attr('fill', getCSSColor('--green'));

    // Animate the arc from 0 to target percentage
    const interpolate = d3.interpolate(0, targetAngle);
    foreground.transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attrTween('d', () => (t: number) => {
        return (arc as any)({ endAngle: interpolate(t) });
      });

    // Center text: percentage value
    g.append('text')
      .attr('class', 'gauge-value')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('dy', '-0.15em')
      .attr('fill', getCSSColor('--text'))
      .attr('font-size', '22px')
      .attr('font-weight', '700')
      .text(`${percentage.toFixed(1)}%`);

    // Center text: "Renewable" label
    g.append('text')
      .attr('class', 'gauge-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('dy', '1.4em')
      .attr('fill', getCSSColor('--text-dim'))
      .attr('font-size', '10px')
      .text('Renewable');

    // Data year label below gauge
    const yearLabel = document.createElement('div');
    yearLabel.className = 'gauge-year';
    Object.assign(yearLabel.style, {
      textAlign: 'center',
      fontSize: '10px',
      color: 'var(--text-dim)',
      marginTop: '4px',
    });
    yearLabel.textContent = `Data from ${year}`;
    container.appendChild(yearLabel);
  }

  /**
   * Render a small D3 area sparkline showing the global renewable % trend.
   */
  private renderSparkline(
    container: HTMLElement,
    historicalData: Array<{ year: number; value: number }>,
  ): void {
    const containerWidth = this.content.clientWidth - 16 || 200;
    const height = 40;
    const margin = { top: 4, right: 8, bottom: 4, left: 8 };
    const width = containerWidth - margin.left - margin.right;

    if (width <= 0) return;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(historicalData, d => d.year) as [number, number];
    const yExtent = d3.extent(historicalData, d => d.value) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

    const x = d3.scaleLinear().domain(xExtent).range([0, width]);
    const y = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0]);

    const greenColor = getCSSColor('--green');

    // Area fill
    const area = d3.area<{ year: number; value: number }>()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(historicalData)
      .attr('d', area)
      .attr('fill', greenColor)
      .attr('opacity', 0.15);

    // Line stroke
    const line = d3.line<{ year: number; value: number }>()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(historicalData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', greenColor)
      .attr('stroke-width', 1.5);
  }

  /**
   * Render the regional breakdown with horizontal bar chart.
   */
  private renderRegions(
    container: HTMLElement,
    regions: RegionRenewableData[],
  ): void {
    // Find max percentage for bar scaling
    const maxPct = Math.max(...regions.map(r => r.percentage), 1);

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]!;
      const row = document.createElement('div');
      row.className = 'region-row';
      Object.assign(row.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
      });

      // Region name
      const nameSpan = document.createElement('span');
      nameSpan.className = 'region-name';
      Object.assign(nameSpan.style, {
        fontSize: '11px',
        color: 'var(--text-dim)',
        minWidth: '120px',
        flexShrink: '0',
      });
      nameSpan.textContent = region.name;

      // Bar container
      const barContainer = document.createElement('div');
      barContainer.className = 'region-bar-container';
      Object.assign(barContainer.style, {
        flex: '1',
        height: '8px',
        background: 'var(--bg-secondary)',
        borderRadius: '4px',
        overflow: 'hidden',
      });

      // Bar fill
      const bar = document.createElement('div');
      bar.className = 'region-bar';
      // Opacity fades from 1.0 (first/highest) to 0.5 (last/lowest)
      const opacity = regions.length > 1
        ? 1.0 - (i / (regions.length - 1)) * 0.5
        : 1.0;
      Object.assign(bar.style, {
        width: `${(region.percentage / maxPct) * 100}%`,
        height: '100%',
        background: getCSSColor('--green'),
        opacity: String(opacity),
        borderRadius: '4px',
        transition: 'width 0.6s ease-out',
      });
      barContainer.appendChild(bar);

      // Value label
      const valueSpan = document.createElement('span');
      valueSpan.className = 'region-value';
      Object.assign(valueSpan.style, {
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text)',
        minWidth: '42px',
        textAlign: 'right',
        flexShrink: '0',
      });
      valueSpan.textContent = `${region.percentage.toFixed(1)}%`;

      row.appendChild(nameSpan);
      row.appendChild(barContainer);
      row.appendChild(valueSpan);
      container.appendChild(row);
    }
  }

  /**
   * Clean up and call parent destroy.
   */
  public destroy(): void {
    super.destroy();
  }
}
