import { useState } from 'react';

const TUTORIALS = {
  linux: {
    title: '🐧 Linux - نظام التشغيل',
    sections: [
      {
        name: 'pwd - اعرف مكانك',
        desc: 'يطبع المسار الكامل للمجلد الحالي',
        example: '$ pwd\n/home/user/Desktop',
      },
      {
        name: 'ls - اعرض الملفات',
        desc: 'يعرض قائمة بالملفات والمجلدات',
        example: '$ ls -la\ndrwx... Documents\n-rw-... hello.txt',
      },
      {
        name: 'cd - انتقل بين المجلدات',
        desc: 'ينقلك من مجلد لآخر',
        example: '$ cd Desktop\n$ pwd\n/home/user/Desktop',
      },
      {
        name: 'mkdir - إنشاء مجلد',
        desc: 'ينشئ مجلد جديد',
        example: '$ mkdir my_folder\n$ ls\nmy_folder',
      },
      {
        name: 'touch - إنشاء ملف',
        desc: 'ينشئ ملف فارغ',
        example: '$ touch hello.txt\n$ ls\nhello.txt',
      },
      {
        name: 'cat - عرض محتوى الملف',
        desc: 'يطبع محتوى الملف',
        example: '$ cat hello.txt\nHello, World!',
      },
      {
        name: 'grep - البحث عن نص',
        desc: 'يبحث عن كلمة في الملف',
        example: '$ grep "error" log.txt\nerror: connection failed',
      },
      {
        name: 'rm - حذف ملف',
        desc: 'يحذف الملف بشكل دائم',
        example: '$ rm hello.txt\n$ ls\n(لا شيء)',
      },
      {
        name: 'cp - نسخ ملف',
        desc: 'ينسخ الملف أو المجلد',
        example: '$ cp file.txt file_backup.txt\n$ ls\nfile.txt file_backup.txt',
      },
      {
        name: 'chmod - تغيير الأذونات',
        desc: 'يتحكم في صلاحيات الملف',
        example: '$ chmod 755 script.sh\n$ ls -l\nrwxr-xr-x script.sh',
      },
    ],
  },
  bash: {
    title: '🔧 Bash - لغة سكريبتنج',
    sections: [
      {
        name: 'echo - اطبع النص',
        desc: 'يطبع نص على الشاشة',
        example: '$ echo "Hello, World!"\nHello, World!',
      },
      {
        name: 'المتغيرات',
        desc: 'تخزين القيم في متغيرات',
        example: '$ name="Ahmed"\n$ echo $name\nAhmed',
      },
      {
        name: 'العمليات الحسابية',
        desc: 'إجراء عمليات رياضية',
        example: '$ x=10\n$ y=5\n$ echo $((x + y))\n15',
      },
      {
        name: 'if/else - الشروط',
        desc: 'تنفيذ أوامر حسب شرط',
        example: 'if [ $age -ge 18 ]; then\n  echo "Adult"\nfi',
      },
      {
        name: 'for loop - حلقات',
        desc: 'تكرار أوامر عدة مرات',
        example: 'for i in {1..5}; do\n  echo "Count: $i"\ndone',
      },
      {
        name: 'while loop - حلقة شرطية',
        desc: 'تكرار مادام الشرط صحيح',
        example: 'while [ $x -lt 5 ]; do\n  echo $x\n  ((x++))\ndone',
      },
      {
        name: 'Functions - الدوال',
        desc: 'إنشاء دوال قابلة لإعادة الاستخدام',
        example: 'greet() {\n  echo "Hello, $1!"\n}\ngreet "Ahmed"',
      },
      {
        name: 'read - قراءة الـ input',
        desc: 'قراءة مدخلات من المستخدم',
        example: 'read -p "Name: " name\necho "Hi, $name"',
      },
      {
        name: 'Arrays - المصفوفات',
        desc: 'تخزين مجموعة من القيم',
        example: 'arr=("a" "b" "c")\necho ${arr[0]}\na',
      },
      {
        name: 'Pipes و Redirection',
        desc: 'ربط أوامر وتحويل المخرجات',
        example: '$ ls | grep ".txt"\nfile.txt\n$ echo "hi" > file.txt',
      },
    ],
  },
  python: {
    title: '🐍 Python - لغة البرمجة',
    sections: [
      {
        name: 'print - اطبع النص',
        desc: 'طباعة على الشاشة',
        example: '>>> print("Hello, World!")\nHello, World!',
      },
      {
        name: 'المتغيرات والأنواع',
        desc: 'تخزين البيانات بأنواع مختلفة',
        example: '>>> name = "Ahmed"\n>>> age = 25\n>>> print(name, age)\nAhmed 25',
      },
      {
        name: 'العمليات الحسابية',
        desc: 'حسابات بسيطة وسهلة',
        example: '>>> 10 + 5\n15\n>>> 10 * 3\n30',
      },
      {
        name: 'Strings - النصوص',
        desc: 'التعامل مع النصوص والكلمات',
        example: '>>> text = "Hello"\n>>> len(text)\n5\n>>> text.upper()\nHELLO',
      },
      {
        name: 'Lists - المصفوفات',
        desc: 'تخزين مجموعة من العناصر',
        example: '>>> fruits = ["apple", "banana"]\n>>> fruits[0]\napple\n>>> len(fruits)\n2',
      },
      {
        name: 'if/else - الشروط',
        desc: 'اتخاذ قرارات حسب الشروط',
        example: '>>> age = 20\n>>> if age >= 18:\n...     print("Adult")\nAdult',
      },
      {
        name: 'for loop - حلقات',
        desc: 'تكرار على عناصر',
        example: '>>> for i in range(3):\n...     print(i)\n0\n1\n2',
      },
      {
        name: 'while loop - حلقة شرطية',
        desc: 'تكرار مادام الشرط صحيح',
        example: '>>> x = 0\n>>> while x < 3:\n...     print(x)\n...     x += 1',
      },
      {
        name: 'Functions - الدوال',
        desc: 'إنشاء دوال قابلة لإعادة الاستخدام',
        example: '>>> def add(a, b):\n...     return a + b\n>>> add(5, 3)\n8',
      },
      {
        name: 'Dictionaries - القواميس',
        desc: 'تخزين بيانات بمفاتيح',
        example: '>>> person = {"name": "Ahmed", "age": 25}\n>>> person["name"]\nAhmed',
      },
    ],
  },
};

export function TutorialsPage() {
  const [selectedLang, setSelectedLang] = useState('linux');
  const [expandedSection, setExpandedSection] = useState(null);

  const tutorial = TUTORIALS[selectedLang];

  const colors = {
    linux: { primary: '#00ff88', dark: '#005c2f' },
    bash: { primary: '#00ddff', dark: '#004466' },
    python: { primary: '#3776ab', dark: '#1a2638' },
  };

  const color = colors[selectedLang];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e27',
      color: '#e0e0e0',
      padding: '40px 20px',
      fontFamily: 'Cairo, sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{
          textAlign: 'center',
          color: color.primary,
          marginBottom: 40,
          textShadow: `0 0 10px ${color.primary}`,
          fontSize: 32,
        }}>
          📚 شروحات تفصيلية
        </h1>

        {/* Language selector */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          marginBottom: 40,
          flexWrap: 'wrap',
        }}>
          {['linux', 'bash', 'python'].map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: `2px solid ${colors[lang].primary}`,
                background: selectedLang === lang ? colors[lang].primary : 'transparent',
                color: selectedLang === lang ? '#000' : colors[lang].primary,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontSize: 14,
              }}
              onMouseOver={(e) => {
                if (selectedLang !== lang) {
                  e.target.style.background = colors[lang].primary + '20';
                }
              }}
              onMouseOut={(e) => {
                if (selectedLang !== lang) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {lang === 'linux' && '🐧 Linux'}
              {lang === 'bash' && '🔧 Bash'}
              {lang === 'python' && '🐍 Python'}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div>
          {tutorial.sections.map((section, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 16,
                border: `1px solid ${color.primary}40`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {/* Section header */}
              <div
                onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                style={{
                  background: color.primary + '10',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = color.primary + '20'}
                onMouseOut={(e) => e.currentTarget.style.background = color.primary + '10'}
              >
                <div>
                  <h3 style={{
                    color: color.primary,
                    margin: '0 0 4px 0',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                    {section.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#999',
                    fontSize: 13,
                  }}>
                    {section.desc}
                  </p>
                </div>
                <span style={{
                  color: color.primary,
                  fontSize: 20,
                  transition: 'transform 0.3s',
                  transform: expandedSection === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>

              {/* Section body */}
              {expandedSection === idx && (
                <div style={{
                  background: '#1a1f3a',
                  padding: '20px',
                  borderTop: `1px solid ${color.primary}40`,
                }}>
                  <pre style={{
                    background: '#0a0e27',
                    padding: '16px',
                    borderRadius: 6,
                    color: color.primary,
                    overflow: 'auto',
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}>
                    {section.example}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 40,
          padding: '20px',
          background: color.primary + '10',
          borderRadius: 8,
          textAlign: 'center',
          color: '#999',
          fontSize: 13,
        }}>
          💡 كل الأمثلة هنا تفاعلية — جرب الأوامر في Terminal أو Python Playground!
        </div>
      </div>
    </div>
  );
}
