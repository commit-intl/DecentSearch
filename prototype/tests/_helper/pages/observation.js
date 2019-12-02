const ServerMonitor = function(addr) {
  this.addr = addr; 
}

ServerMonitor.prototype = {
  init(parentElement) {
    this.parentElement = parentElement;
    this.element = document.createElement('pre');
    this.element.style.display = 'inline-block';
    this.element.style.overflow = 'auto';
    this.element.style.width = '25%';
    this.parentElement.appendChild(this.element);

    this.interval = setInterval(this.update.bind(this), 2500); 
  },

  update() {
    fetch(this.addr+'/contact', {
      method: 'GET',
      mode: 'cors',
    })
    .then(response => response.json())
    .then((value) => this.element.textContent = JSON.stringify(value, null, 2));
  }
};

const handleServers = (servers) => {
  const monitors = [];
  for (let server of servers) {
    const monitor = new ServerMonitor(server);
    monitor.init(document.body);
    monitors.push(monitor);
  }
}

fetch('/api/servers').then(response => response.json()).then(handleServers);
