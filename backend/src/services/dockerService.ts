import { exec } from 'child_process';
import { dbService } from './dbService';

class DockerService {
  // Check if docker daemon is reachable
  async isDockerInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('docker --version', (err) => {
        resolve(!err);
      });
    });
  }

  // Stream virtual metrics updates
  getSystemMetrics() {
    const containers = dbService.getContainers();
    return containers.map(container => {
      if (container.status === 'running') {
        // Add light fluctuation to CPU
        const cpuOffset = (Math.random() - 0.5) * 0.4;
        container.cpu = Math.max(0.1, parseFloat((container.cpu + cpuOffset).toFixed(1)));
        
        // Random memory usage changes
        const currentMem = parseFloat(container.memory.split(' ')[0]);
        const memOffset = (Math.random() - 0.5) * 2.0;
        container.memory = `${Math.max(10, parseFloat((currentMem + memOffset).toFixed(1)))} MB`;
      } else {
        container.cpu = 0;
      }
      return {
        id: container.id,
        name: container.name,
        status: container.status,
        cpu: container.cpu,
        memory: container.memory
      };
    });
  }

  // Execute terminal execution simulator
  async runDockerCommand(command: string): Promise<string> {
    // If user types standard docker commands, we can simulate responses
    const cmd = command.trim().toLowerCase();
    
    if (cmd.includes('docker ps')) {
      const list = dbService.getContainers();
      let output = 'CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS\n';
      list.forEach(c => {
        const statusStr = c.status === 'running' ? 'Up 5 minutes' : 'Exited (0) 2 minutes ago';
        output += `${c.id.padEnd(14)}${c.image.padEnd(26)}"${'docker-entrypoint.s'.padEnd(22)}"   5 mins ago      ${statusStr.padEnd(14)}   0.0.0.0:${c.ports}->${c.ports.split(':')[1]}\n`;
      });
      return output;
    }

    if (cmd.includes('docker stop')) {
      const match = command.match(/docker stop\s+([a-zA-Z0-9-]+)/);
      if (match) {
        const target = match[1];
        const container = dbService.getContainers().find(c => c.name === target || c.id === target);
        if (container) {
          dbService.updateContainerStatus(container.id, 'stopped');
          return target;
        }
      }
      return 'Error: No such container';
    }

    if (cmd.includes('docker start')) {
      const match = command.match(/docker start\s+([a-zA-Z0-9-]+)/);
      if (match) {
        const target = match[1];
        const container = dbService.getContainers().find(c => c.name === target || c.id === target);
        if (container) {
          dbService.updateContainerStatus(container.id, 'running');
          return target;
        }
      }
      return 'Error: No such container';
    }

    if (cmd.includes('docker images')) {
      return `REPOSITORY                TAG       IMAGE ID       CREATED        SIZE
nextjs-frontend           latest    f5a2b3c4d5e6   2 hours ago    145MB
node-express-backend      latest    a1b2c3d4e5f6   2 hours ago    88.1MB
mongo                     6.0       3d4e5f6a7b8c   3 weeks ago    312MB
alpine                    latest    c1d2e3f4a5b6   5 weeks ago    7.05MB`;
    }

    // Otherwise try to run actual local shell if allowed, or mock standard logs
    return `Command '${command}' executed successfully inside local virtual kernel.`;
  }
}

export const dockerService = new DockerService();
