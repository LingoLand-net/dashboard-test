// StatCard Component - displays a key metric
export function createStatCard(label, value, icon = '📊', trend = null) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  
  let trendHTML = '';
  if (trend) {
    const trendClass = trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral';
    const trendSymbol = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    trendHTML = `<div class="stat-trend ${trendClass}">${trendSymbol} ${Math.abs(trend)}%</div>`;
  }
  
  card.innerHTML = `
    <div class="stat-icon">${icon}</div>
    <div class="stat-content">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${typeof value === 'number' ? value.toLocaleString() : value}</div>
      ${trendHTML}
    </div>
  `;
  
  return card;
}

export function mountStatCards(container, stats) {
  const wrapper = document.createElement('div');
  wrapper.className = 'stat-cards';
  
  stats.forEach(stat => {
    wrapper.appendChild(createStatCard(stat.label, stat.value, stat.icon, stat.trend));
  });
  
  container.appendChild(wrapper);
}
