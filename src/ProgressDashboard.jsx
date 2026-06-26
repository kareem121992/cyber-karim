import { useEffect, useState } from 'react';

export function ProgressDashboard({ user, progress, xp }) {
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    lessonsTotal: 0,
    avgScore: 0,
    streakDays: 0,
    hoursSpent: 0,
    skillsAcquired: []
  });

  useEffect(() => {
    // حساب الإحصائيات
    const lessonsCompleted = Object.values(progress || {}).reduce((a, b) => a + b.length, 0);
    const lessonsTotal = 240; // من data.js
    const avgScore = Math.floor(Math.random() * 30 + 70); // placeholder
    
    setStats({
      lessonsCompleted,
      lessonsTotal,
      avgScore,
      streakDays: 7,
      hoursSpent: Math.floor(lessonsCompleted * 1.5),
      skillsAcquired: ['Linux', 'Bash', 'Network Scanning', 'Web Testing']
    });
  }, [progress]);

  const colors = {
    bg: '#0a0e27',
    bg2: '#1a1f3a',
    text: '#e0e0e0',
    primary: '#00ff88',
    secondary: '#00ddff',
    accent: '#ff00ff',
    success: '#00ff88',
    warning: '#ffaa00'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      padding: '40px 20px',
      fontFamily: 'Cairo, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          marginBottom: 40,
          textAlign: 'center'
        }}>
          <h1 style={{
            color: colors.primary,
            fontSize: 32,
            marginBottom: 10,
            textShadow: `0 0 10px ${colors.primary}`
          }}>
            📊 لوحة تقدمك
          </h1>
          <p style={{ color: colors.text, fontSize: 14 }}>
            {user?.displayName || 'مستخدم'} — تقدمك الشامل والتفاصيلي
          </p>
        </div>

        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}>
          
          {/* Stat Card 1: Lessons */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.primary}`,
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            boxShadow: `0 0 20px ${colors.primary}40`
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            <div style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>
              {stats.lessonsCompleted}/{stats.lessonsTotal}
            </div>
            <div style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>دروس مكتملة</div>
            <div style={{
              marginTop: 12,
              height: 6,
              background: colors.bg,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: colors.primary,
                width: `${(stats.lessonsCompleted / stats.lessonsTotal) * 100}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Stat Card 2: XP */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.secondary}`,
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            boxShadow: `0 0 20px ${colors.secondary}40`
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
            <div style={{ color: colors.secondary, fontSize: 24, fontWeight: 'bold' }}>
              {xp || 0}
            </div>
            <div style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>نقاط خبرة</div>
            <div style={{ marginTop: 10, fontSize: 11, color: colors.text }}>
              +{Math.floor(Math.random() * 50 + 50)} هذا الأسبوع
            </div>
          </div>

          {/* Stat Card 3: Streak */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.warning}`,
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            boxShadow: `0 0 20px ${colors.warning}40`
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔥</div>
            <div style={{ color: colors.warning, fontSize: 24, fontWeight: 'bold' }}>
              {stats.streakDays}
            </div>
            <div style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>أيام متتالية</div>
          </div>

          {/* Stat Card 4: Hours */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.accent}`,
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            boxShadow: `0 0 20px ${colors.accent}40`
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏱️</div>
            <div style={{ color: colors.accent, fontSize: 24, fontWeight: 'bold' }}>
              {stats.hoursSpent}
            </div>
            <div style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>ساعة مستثمرة</div>
          </div>
        </div>

        {/* Skills Section */}
        <div style={{
          background: colors.bg2,
          border: `2px solid ${colors.primary}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 40
        }}>
          <h3 style={{ color: colors.primary, marginBottom: 15, marginTop: 0 }}>
            🎯 المهارات المكتسبة
          </h3>
          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            {stats.skillsAcquired.map((skill, i) => (
              <div key={i} style={{
                background: `${colors.primary}20`,
                border: `1px solid ${colors.primary}`,
                borderRadius: 20,
                padding: '8px 16px',
                color: colors.primary,
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                ✓ {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20
        }}>
          
          {/* Learning by Category */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.secondary}`,
            borderRadius: 12,
            padding: 20
          }}>
            <h4 style={{ color: colors.secondary, marginTop: 0 }}>📖 التعلم بـ الفئات</h4>
            {['Linux', 'Bash', 'Python', 'Web Hacking'].map((cat, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 12
                }}>
                  <span>{cat}</span>
                  <span style={{ color: colors.secondary }}>{Math.floor(Math.random() * 80 + 20)}%</span>
                </div>
                <div style={{
                  height: 4,
                  background: colors.bg,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: colors.secondary,
                    width: `${Math.floor(Math.random() * 80 + 20)}%`
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Achievements Preview */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.accent}`,
            borderRadius: 12,
            padding: 20
          }}>
            <h4 style={{ color: colors.accent, marginTop: 0 }}>🏆 الإنجازات</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10
            }}>
              {['🎓', '📚', '🧠', '💻', '🔓', '⭐'].map((badge, i) => (
                <div key={i} style={{
                  fontSize: 24,
                  textAlign: 'center',
                  padding: 10,
                  background: `${colors.accent}10`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  ':hover': { transform: 'scale(1.1)' }
                }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Study Consistency */}
          <div style={{
            background: colors.bg2,
            border: `2px solid ${colors.warning}`,
            borderRadius: 12,
            padding: 20,
            gridColumn: '1 / -1'
          }}>
            <h4 style={{ color: colors.warning, marginTop: 0 }}>📈 الاتساق في الدراسة</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i}>
                  <div style={{
                    height: 30,
                    background: i < 6 ? colors.warning : colors.bg,
                    borderRadius: 4,
                    marginBottom: 4,
                    opacity: Math.random() > 0.3 ? 1 : 0.3
                  }} />
                  <div style={{ fontSize: 10, textAlign: 'center', color: colors.text }}>
                    {day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
