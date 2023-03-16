document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket(
    (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host
  );
  const resultElement = document.getElementById('result');
  const nicknameInput = document.getElementById('nickname');
  const tableBody = document.getElementById('roles-table-body');
  const rolePicks = new Map();
  const resetButton = document.getElementById('reset-server');
  const showRolesButton = document.getElementById('show-roles');
  const themeToggleButton = document.getElementById('theme-toggle');
  const moonIcon = themeToggleButton.querySelector('.fa-moon');
  const sunIcon = themeToggleButton.querySelector('.fa-sun');

  themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    moonIcon.style.display = moonIcon.style.display === 'none' ? '' : 'none';
    sunIcon.style.display = sunIcon.style.display === 'none' ? '' : 'none';
  });

  resetButton.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'resetData' }));
  });

  document.querySelectorAll('.role').forEach((button) => {
    button.addEventListener('click', (e) => {
      const role = e.target.dataset.role;
      const nickname = nicknameInput.value.trim();
      if (!nickname) {
        alert('Please enter your nickname.');
        return;
      }
      socket.send(JSON.stringify({ nickname, role }));
    });
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'initialRoles') {
      data.roles.forEach((rolePick) => {
        addOrUpdateRolePick(rolePick.nickname, rolePick.roles.join(', '));
      });
    } else if (data.type === 'newRole') {
        addOrUpdateRolePick(data.nickname, data.role);
    } else if (data.type === 'resetData') {
      tableBody.innerHTML = ''; // Clear the table content
      rolePicks.clear(); // Clear the rolePicks Map
    }
  });

  function addOrUpdateRolePick(nickname, role) {
    if (rolePicks.has(nickname)) {
      const existingRow = rolePicks.get(nickname);
      const existingRoles = existingRow.dataset.roles.split(', ');

      if (!existingRoles.includes(role)) {
        existingRoles.push(role);
        existingRow.cells[1].textContent = existingRoles.join(', ');
        existingRow.dataset.roles = existingRoles.join(', ');
      }
    } else {
      const newRow = tableBody.insertRow();
      const nicknameCell = newRow.insertCell();
      const roleCell = newRow.insertCell();

      nicknameCell.textContent = nickname;
      roleCell.textContent = role;

      newRow.dataset.roles = role;
      rolePicks.set(nickname, newRow);
    }
  }

  showRolesButton.addEventListener('click', () => {
    const roles = {
      'Safe Lane': [],
      'Mid Lane': [],
      'Hard Support': [],
      'Soft Support': [],
      'Offlane': [],
    };

    rolePicks.forEach((row, nickname) => {
      const pickedRoles = row.dataset.roles.split(', ');
      pickedRoles.forEach((role) => {
        roles[role].push(nickname);
      });
    });

    const selectedRoles = {};
    const assignedPlayers = new Set();

    for (const role in roles) {
      const availablePlayers = roles[role].filter((player) => !assignedPlayers.has(player));

      if (availablePlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        const selectedPlayer = availablePlayers[randomIndex];
        selectedRoles[role] = selectedPlayer;
        assignedPlayers.add(selectedPlayer);
      } else {
        selectedRoles[role] = 'No players';
      }
    }

    let rolesMessage = 'Selected roles:\n';
    for (const role in selectedRoles) {
      rolesMessage += `${role}: ${selectedRoles[role]}\n`;
    }
    alert(rolesMessage);
    });

  if (document.body.classList.contains('dark-theme')) {
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
  }
});

