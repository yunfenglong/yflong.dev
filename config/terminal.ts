import { FileSystemItem, BootMessage } from '@/types/terminal';

export const fileSystem: Record<string, FileSystemItem[]> = {
  '/home/yflong': [
    { name: 'projects', type: 'directory', modified: new Date('2025-01-15'), permissions: 'drwxr-xr-x' },
    { name: 'documents', type: 'directory', modified: new Date('2025-01-14'), permissions: 'drwxr-xr-x' },
    { name: 'downloads', type: 'directory', modified: new Date('2025-01-13'), permissions: 'drwxr-xr-x' },
    { name: '.bashrc', type: 'file', size: 3423, modified: new Date('2025-01-10'), permissions: '-rw-r--r--' },
    { name: 'README.md', type: 'file', size: 1024, modified: new Date('2025-01-12'), permissions: '-rw-r--r--' },
    { name: 'source-code.txt', type: 'file', size: 1024, modified: new Date('2025-08-23'), permissions: '-rw-r--r--' },
    { name: 'mail.txt', type: 'file', size: 1024, modified: new Date('2025-05-01'), permissions: '-rw-r--r--' },
    { name: 'pypi.whl', type: 'file', size: 1024, modified: new Date('2025-03-03'), permissions: '-rw-r--r--' },
    { name: 'config.py', type: 'file', size: 1024, modified: new Date('1984-08-09'), permissions: '-rw-r--r--' },
  ],
  '/home/yflong/projects': [
    { name: 'web-app', type: 'directory', modified: new Date('2025-01-15'), permissions: 'drwxr-xr-x' },
    { name: 'ffuf-force', type: 'directory', modified: new Date('2025-01-13'), permissions: 'drwxr-xr-x' },
    { name: 'worker.js', type: 'file', size: 15420, modified: new Date('2025-01-15'), permissions: '-rw-r--r--' },
  ],
  '/home/yflong/documents': [
    { name: 'notes.txt', type: 'file', size: 2048, modified: new Date('2025-01-11'), permissions: '-rw-r--r--' },
    { name: 'contracts', type: 'directory', modified: new Date('2025-01-09'), permissions: 'drwxr-xr-x' },
  ],
  '/home/yflong/downloads': [
    { name: 'ubuntu-22.04.iso', type: 'file', size: 4700000000, modified: new Date('2025-01-08'), permissions: '-rw-r--r--' },
    { name: 'node-v18.tar.gz', type: 'file', size: 45000000, modified: new Date('2025-01-07'), permissions: '-rw-r--r--' },
  ],
};

export const bootMessages: BootMessage[] = [
  { content: 'Initializing secure connection...', delay: 0 },
  { content: 'SSH handshake successful', delay: 1200 },
  { content: 'Authenticating user credentials...', delay: 600 },
  { content: 'RSA key fingerprint: SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8', delay: 900 },
  { content: 'Authentication successful', delay: 700 },
  { content: 'Establishing encrypted tunnel...', delay: 500 },
  { content: 'Connection established - AES-256 encryption active', delay: 800 },
  { content: '', delay: 400 },
  { content: 'Welcome to yflong secure terminal', delay: 600 },
  { content: 'Connecting to yflong-server.local:22...', delay: 0 },
  { content: '', delay: 200 }
];

export const availableCommands = [
  'help', 'ls', 'pwd', 'cd', 'cat', 'whoami', 'date', 'uname', 'ps', 
  'top', 'free', 'df', 'uptime', 'clear', 'history', 'echo', 'mkdir', 
  'touch', 'rm', 'tree', 'neofetch', 'exit'
];

export const fileContents: Record<string, string> = {
  '.bashrc': `# ~/.bashrc: executed by bash(1) for non-login shells.

export PATH=$HOME/bin:/usr/local/bin:$PATH
export EDITOR=vim
export BROWSER=firefox

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# Custom prompt
PS1='\\[\\033[01;37m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;37m\\]\\w\\[\\033[00m\\]\\$ '

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000`,
  'README.md': 'Full Stack, GUI, Web development, Automation, ML, Data integration, BB & etc.',
  'mail.txt': 'teur@yflong.dev',
  'pypi.whl': 'https://pypi.org/user/ivuxy',
  'source-code.txt': 'https://github.com/yunfenglong/yflong.dev',
  'config.py': 'class Production(Config): LOGGER = True',
  'notes.txt': 'Stay focused on OWASP & Web Security'
};

export const systemOutputs = {
  ps: `    PID TTY          TIME CMD
   1234 pts/0    00:00:01 bash
   5678 pts/0    00:00:03 node
   9012 pts/0    00:00:02 python3
   3456 pts/0    00:00:01 code
   7890 pts/0    00:00:00 docker
   2468 pts/0    00:00:00 ps`,
  
  top: (time: string) => `top - ${time} up 7 days, 14:23, 1 user, load average: 0.52, 0.58, 0.59
Tasks: 312 total,   1 running, 311 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.4 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  32768.0 total,  12847.2 free,   8234.1 used,  11686.7 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  23456.8 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1234 yflong     20   0 1234567  123456  12345 S   5.2   0.4   1:23.45 node
   5678 yflong     20   0  987654   98765   9876 S   3.1   0.3   0:45.67 python3
   9012 yflong     20   0  654321   65432   6543 S   1.8   0.2   0:23.45 code`,
  
  free: `               total        used        free      shared  buff/cache   available
Mem:        33554432    8456789    13456789      123456    11640854    24097643
Swap:        2097152          0     2097152`,
  
  df: `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1       98566400  45678901  47887499  49% /
/dev/sda2        1048576    123456    925120  12% /boot
tmpfs           16777216         0  16777216   0% /dev/shm
tmpfs           16777216      1234  16775982   1% /run`,
  
  uptime: (time: string) => ` ${time} up 7 days, 14:23, 1 user, load average: 0.52, 0.58, 0.59`,
  
  tree: (currentDirectory: string) => `${currentDirectory}
├── projects/
│   ├── web-app/
│   ├── ffuf-force/
│   └── worker.js
├── documents/
│   ├── notes.txt
│   └── contracts/
├── downloads/
│   ├── ubuntu-22.04.iso
│   └── node-v18.tar.gz
├── pypi.whl
├── config.py
├── mail.txt
├── source-code.txt
├── .bashrc
└── README.md

6 directories, 8 files`,
  
  neofetch: `                   -\`                    yflong@workstation
                  .o+\`                   ------------------
                 \`ooo/                   OS: Ubuntu 22.04.3 LTS x86_64
                \`+oooo:                  Host: Professional Workstation
               \`+oooooo:                 Kernel: 6.2.0-39-generic
               -+oooooo+:                Uptime: 7 days, 14 hours, 23 mins
             \`/:-:++oooo+:               Packages: 2847 (dpkg), 63 (snap)
            \`/++++/+++++++:              Shell: bash 5.1.16
           \`/++++++++++++++:             Resolution: 3840x2160
          \`/+++ooooooooooooo/\`           DE: GNOME 42.9
         ./ooosssso++osssssso+\`          WM: Mutter
        .oossssso-\`\`\`\`/ossssss+\`         WM Theme: Adwaita
       -osssssso.      :ssssssso.        Theme: Yaru-blue [GTK2/3]
      :osssssss/        osssso+++.       Icons: Yaru [GTK2/3]
     /ossssssss/        +ssssooo/-       Terminal: gnome-terminal
   \`/ossssso+/:-        -:/+osssso+-     CPU: Intel i7-12700K (20) @ 5.000GHz
  \`+sso+:-\`                 \`.-/+oso:    GPU: NVIDIA GeForce RTX 4080
 \`++:.                           \`-/+/   Memory: 8456MiB / 32768MiB
 .\`                                 \`/`,
  
  uname: 'Linux',
  unameAll: `Linux yflong-procrastination-station
1.9.9-beta-rc42-duct-tape #40~22.04.1-Arch-BTW 
AGGRESSIVE_GARBAGE_COLLECTION Way Past 
Thu Nov 16 10:53:04 UTC 2023 x86_64 x86_64 x86_64 GNU/Plus/A-Dash-Of-Systemd`
};
