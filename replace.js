const fs = require('fs');
const file = "src/app/app/settings/page.tsx";
let content = fs.readFileSync(file, 'utf8');

const newJSX = `    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <style>{\`
        .settings-group {
          background: var(--surface-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .settings-item {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid var(--border);
        }
        .settings-item:last-child {
          border-bottom: none;
        }
        .settings-item-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px 20px;
          border-bottom: 0.5px solid var(--border);
        }
        .settings-item-col:last-child {
          border-bottom: none;
        }
        .settings-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .settings-desc {
          font-size: 13px;
          color: var(--text-hint);
          margin-top: 2px;
        }
        .settings-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: 16px;
          margin-bottom: 8px;
        }
      \`}</style>

      <div className="settings-section-title">บัญชีผู้ใช้</div>
      <div className="settings-group">
        <div className="settings-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IconUser size={24} style={{ color: 'var(--text-hint)' }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{user?.displayName || 'ผู้ใช้'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section-title">ความปลอดภัย & ระบบ</div>
      <div className="settings-group">
        <div className="settings-item-col">
          {pinMsg && (
            <div style={{ 
              padding: '10px 16px', borderRadius: 12, marginBottom: 16, width: '100%',
              background: 'var(--success-light)', color: 'var(--success)', fontSize: 13, fontWeight: 600,
            }}>
              {pinMsg}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <div className="settings-title">รหัสผ่าน (PIN)</div>
              <div className="settings-desc">
                {hasPin ? 'มีรหัสผ่านแล้ว' : 'ยังไม่ได้ตั้งรหัสผ่าน'}
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowPinForm(!showPinForm);
                setPinError('');
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
              }}
              style={{ fontSize: 13, padding: '6px 14px', height: 'auto' }}
            >
              {hasPin ? 'จัดการ' : 'ตั้งค่า'}
            </button>
          </div>

          {showPinForm && (
            <div style={{ 
              marginTop: 16, padding: 16, borderRadius: 16, width: '100%',
              background: 'var(--surface-base)', border: '1px solid var(--border)',
            }}>
              {hasPin && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    รหัสผ่านเดิม
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => { setCurrentPin(e.target.value.replace(/\\D/g, '')); setPinError(''); }}
                    placeholder="●●●●"
                    className="input"
                    style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8 }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  รหัสผ่านใหม่ (4-6 หลัก)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => { setNewPin(e.target.value.replace(/\\D/g, '')); setPinError(''); }}
                  placeholder="●●●●"
                  className="input"
                  style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => { setConfirmPin(e.target.value.replace(/\\D/g, '')); setPinError(''); }}
                  placeholder="●●●●"
                  className="input"
                  style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8 }}
                />
              </div>

              {pinError && (
                <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertCircle size={14} /> {pinError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleSetPin} style={{ flex: 1, height: 44, borderRadius: 14 }}>
                  บันทึก
                </button>
                {hasPin && (
                  <button className="btn-ghost" onClick={handleRemovePin} style={{ height: 44, borderRadius: 14, color: 'var(--danger)' }}>
                    ลบ PIN
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="settings-item">
          <div>
            <div className="settings-title">ธีมแอปพลิเคชัน</div>
            <div className="settings-desc">โหมด {theme === 'light' ? 'สว่าง' : 'มืด'}</div>
          </div>
          <button className="btn-secondary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', height: 'auto' }}>
            {theme === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
            สลับโหมด
          </button>
        </div>
      </div>

      <div className="settings-section-title">การเชื่อมต่อ & บริการ</div>
      <div className="settings-group">
        <div className="settings-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(66, 133, 244, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCloud size={20} style={{ color: '#4285F4' }} />
            </div>
            <div>
              <div className="settings-title">Google Workspace</div>
              <div className="settings-desc" style={{ color: googleAccessToken ? 'var(--success)' : 'var(--text-hint)' }}>
                {googleAccessToken ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
              </div>
            </div>
          </div>
          <button className="btn-secondary" onClick={signIn} style={{ fontSize: 13, padding: '6px 14px', height: 'auto' }}>
            {googleAccessToken ? 'อัปเดต' : 'เชื่อมต่อ'}
          </button>
        </div>

        {notifSupported && (
          <div className="settings-item">
            <div>
              <div className="settings-title">การแจ้งเตือน (Push)</div>
              <div className="settings-desc">
                {isSubscribed ? 'รับการแจ้งเตือน' : 'ปิดการแจ้งเตือน'}
              </div>
            </div>
            <button
              className={isSubscribed ? 'btn-secondary' : 'btn-primary'}
              onClick={isSubscribed ? unsubscribe : subscribe}
              style={{ fontSize: 13, padding: '6px 14px', height: 'auto', borderRadius: 999 }}
            >
              {isSubscribed ? 'ปิด' : 'เปิด'}
            </button>
          </div>
        )}
      </div>

      <div className="settings-section-title">ปัญญาประดิษฐ์ (AI)</div>
      <div className="settings-group">
        <div className="settings-item-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 }}>
            <div>
              <div className="settings-title">ความจำ AI ({memories.length} รายการ)</div>
              <div className="settings-desc">ข้อมูลที่ AI จดจำเกี่ยวกับคุณ</div>
            </div>
            {memories.length > 0 && (
              <button className="btn-ghost" onClick={clearAllMemories} style={{ fontSize: 13, color: 'var(--danger)', padding: '6px 12px', height: 'auto' }}>
                ล้างทั้งหมด
              </button>
            )}
          </div>
          
          {memories.length === 0 ? (
            <div style={{ padding: '12px', background: 'var(--surface-base)', borderRadius: 12, width: '100%', textAlign: 'center', fontSize: 13, color: 'var(--text-hint)' }}>
              ยังไม่มีข้อมูลการจำ
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {memories.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'var(--surface-base)', fontSize: 13,
                  border: '1px solid var(--border)'
                }}>
                  <span style={{ flex: 1, color: 'var(--text-primary)' }}>{m.value}</span>
                  <button
                    className="btn-icon"
                    onClick={() => deleteMemory(m.id)}
                    style={{ padding: 4, width: 28, height: 28, opacity: 0.6 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isInstalled && installPrompt && (
        <div className="settings-group" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
          <div className="settings-item" style={{ border: 'none' }}>
            <div>
              <div className="settings-title" style={{ color: 'var(--accent)' }}>ติดตั้ง JamDai App</div>
              <div className="settings-desc" style={{ color: 'var(--text-secondary)' }}>ใช้งานได้รวดเร็วขึ้นผ่าน Home Screen</div>
            </div>
            <button className="btn-primary" onClick={installApp} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', height: 'auto' }}>
              <IconDownload size={14} /> ติดตั้ง
            </button>
          </div>
        </div>
      )}

      <div className="settings-section-title">เกี่ยวกับระบบ</div>
      <div className="settings-group">
        <div className="settings-item">
          <div>
            <div className="settings-title">JamDai OS</div>
            <div className="settings-desc">เวอร์ชัน {CURRENT_VERSION}</div>
          </div>
          <Link href="/app/whats-new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--accent)', fontSize: 13, fontWeight: 500,
            textDecoration: 'none', background: 'var(--accent-soft)',
            padding: '6px 12px', borderRadius: 999
          }}>
            มีอะไรใหม่?
          </Link>
        </div>
        <div className="settings-item" style={{ justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-hint)', fontSize: 12 }}>
            ออกแบบและพัฒนาโดย รพีพัฒน์ กวางทอง
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <button className="btn-secondary" onClick={signOut} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', color: 'var(--danger)', height: 48, borderRadius: 16 }}>
          <IconLogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>`;

content = content.replace(/<div className="animate-in" style={{ maxWidth: 600 }}>[\s\S]*<\/div>/, newJSX);
fs.writeFileSync(file, content, 'utf8');
