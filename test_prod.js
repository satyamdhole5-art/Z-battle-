import { spawn } from 'child_process';
const server = spawn('npx', ['tsx', 'server.ts'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});
setTimeout(async () => {
    try {
        const r = await fetch('http://localhost:3000/download');
        console.log('Production mode status:', r.status);
    } catch(e) {
        console.log(e);
    }
    server.kill();
    process.exit(0);
}, 3000);
