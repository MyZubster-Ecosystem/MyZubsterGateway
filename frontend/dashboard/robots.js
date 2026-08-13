// Robot Dashboard — WebSocket real-time updates
(function() {
  'use strict';

  // Configuration
  const WS_URL = location.protocol === 'https:'
    ? 'wss://' + location.host + '/ws'
    : 'ws://' + location.host + '/ws';
  const RECONNECT_DELAY = 3000;
  const MAX_RECONNECT_ATTEMPTS = 10;

  // State
  let robots = new Map();
  let stats = { activeRobots: 0, ongoingJobs: 0, myzEarned: 0, escrowBalance: 0 };
  let ws = null;
  let reconnectAttempts = 0;
  let currentFilter = 'all';
  let chartData = { labels: [], datasets: [{ label: 'Jobs', data: [] }, { label: 'Robots', data: [] }] };

  // DOM elements
  const connectionStatus = document.getElementById('connection-status');
  const lastUpdate = document.getElementById('last-update');
  const robotList = document.getElementById('robot-list');
  const activityChart = document.getElementById('activity-chart');
  const ctx = activityChart ? activityChart.getContext('2d') : null;

  // Chart initialization
  let chart = null;
  if (ctx) {
    chart = createChart(ctx);
  }

  function createChart(context) {
    return {
      _data: [],
      draw: function() {
        const w = context.canvas.width;
        const h = context.canvas.height;
        context.clearRect(0, 0, w, h);

        if (this._data.length === 0) {
          context.fillStyle = '#484f58';
          context.font = '14px sans-serif';
          context.textAlign = 'center';
          context.fillText('No activity data yet', w / 2, h / 2);
          return;
        }

        const points = this._data.slice(-20);
        const maxVal = Math.max(...points.flatMap(p => [p.jobs, p.robots]), 5);
        const barWidth = (w - 40) / points.length / 3;

        context.fillStyle = '#8b949e';
        context.font = '11px sans-serif';
        context.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
          const y = h - 20 - (i / 4) * (h - 40);
          context.fillText(Math.round(maxVal * i / 4), 30, y + 4);
        }

        points.forEach((p, i) => {
          const x = 40 + i * (w - 40) / points.length;
          const jobH = (p.jobs / maxVal) * (h - 40);
          const robotH = (p.robots / maxVal) * (h - 40);

          context.fillStyle = '#58a6ff';
          context.fillRect(x, h - 20 - jobH, barWidth, jobH);

          context.fillStyle = '#3fb950';
          context.fillRect(x + barWidth + 2, h - 20 - robotH, barWidth, robotH);
        });

        context.fillStyle = '#58a6ff';
        context.fillRect(w - 130, 10, 10, 10);
        context.fillStyle = '#c9d1d9';
        context.font = '11px sans-serif';
        context.textAlign = 'left';
        context.fillText('Jobs', w - 115, 19);

        context.fillStyle = '#3fb950';
        context.fillRect(w - 130, 25, 10, 10);
        context.fillText('Robots', w - 115, 34);
      },
      addPoint: function(jobs, robots) {
        this._data.push({ jobs, robots, time: new Date() });
        if (this._data.length > 60) this._data.shift();
        this.draw();
      }
    };
  }

  // WebSocket connection
  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      updateConnectionStatus(false);
      scheduleReconnect();
      return;
    }

    ws.onopen = function() {
      reconnectAttempts = 0;
      updateConnectionStatus(true);
      console.log('[RobotDashboard] WebSocket connected');
    };

    ws.onmessage = function(event) {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.warn('[RobotDashboard] Invalid message:', event.data);
      }
    };

    ws.onclose = function() {
      updateConnectionStatus(false);
      scheduleReconnect();
    };

    ws.onerror = function(err) {
      console.error('[RobotDashboard] WebSocket error:', err);
    };
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      connectionStatus.textContent = 'Connection failed — refresh page';
      return;
    }
    reconnectAttempts++;
    setTimeout(connect, RECONNECT_DELAY);
  }

  function updateConnectionStatus(connected) {
    connectionStatus.textContent = connected ? 'Live' : 'Reconnecting...';
    connectionStatus.className = 'status-indicator' + (connected ? ' connected' : '');
  }

  // Message handlers
  function handleMessage(msg) {
    const now = new Date();
    lastUpdate.textContent = 'Updated: ' + now.toLocaleTimeString();

    switch (msg.type) {
      case 'robot:status':
        handleRobotStatus(msg.data);
        break;
      case 'job:progress':
        handleJobProgress(msg.data);
        break;
      case 'escrow:update':
        handleEscrowUpdate(msg.data);
        break;
      case 'snapshot':
        handleSnapshot(msg.data);
        break;
      default:
        console.log('[RobotDashboard] Unknown event:', msg.type);
    }

    updateChart();
    renderRobotList();
  }

  function handleRobotStatus(data) {
    if (!data || !data.id) return;
    robots.set(data.id, {
      id: data.id,
      name: data.name || ('Robot ' + data.id),
      status: data.status || 'idle',
      currentJob: data.currentJob || null,
      myzEarned: data.myzEarned || 0
    });
    recalculateStats();
  }

  function handleJobProgress(data) {
    if (!data) return;
    stats.ongoingJobs = data.activeJobs || stats.ongoingJobs;
    recalculateStats();
  }

  function handleEscrowUpdate(data) {
    if (!data) return;
    stats.escrowBalance = data.balance || stats.escrowBalance;
    stats.myzEarned = data.totalEarned || stats.myzEarned;
    updateStatCards();
  }

  function handleSnapshot(data) {
    if (!data) return;
    if (data.robots && Array.isArray(data.robots)) {
      robots.clear();
      data.robots.forEach(r => robots.set(r.id, r));
    }
    if (data.stats) {
      stats = { ...stats, ...data.stats };
    }
    recalculateStats();
    updateStatCards();
  }

  function recalculateStats() {
    const robotArray = Array.from(robots.values());
    stats.activeRobots = robotArray.filter(r => r.status !== 'idle').length;
    updateStatCards();
  }

  function updateStatCards() {
    document.getElementById('active-robots').textContent = stats.activeRobots;
    document.getElementById('ongoing-jobs').textContent = stats.ongoingJobs;
    document.getElementById('myz-earned').textContent = stats.myzEarned.toLocaleString();
    document.getElementById('escrow-balance').textContent = stats.escrowBalance.toLocaleString();
  }

  function updateChart() {
    if (chart) {
      chart.addPoint(stats.ongoingJobs, stats.activeRobots);
    }
  }

  // Robot list rendering
  function renderRobotList() {
    const items = Array.from(robots.values());
    const filtered = currentFilter === 'all'
      ? items
      : items.filter(r => r.status === currentFilter);

    if (filtered.length === 0) {
      robotList.innerHTML = '<div class="empty-state">No robots match the selected filter</div>';
      return;
    }

    robotList.innerHTML = filtered.map(r =>
      '<div class="robot-card" data-status="' + r.status + '">' +
        '<div>' +
          '<div class="robot-name">' + escapeHtml(r.name) + '</div>' +
          '<div class="robot-job">' + (r.currentJob ? escapeHtml(r.currentJob) : 'No active job') + '</div>' +
        '</div>' +
        '<span class="robot-status status-' + r.status + '">' + r.status + '</span>' +
        '<span class="robot-earned">' + r.myzEarned + ' MYZ</span>' +
      '</div>'
    ).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderRobotList();
    });
  });

  // Start
  connect();
})();