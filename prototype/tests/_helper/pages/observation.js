

const handleServers = (servers) => {
  document.body.innerText = servers.toString();
}


fetch('/api/servers').then(response => response.json()).then(handleServers);
