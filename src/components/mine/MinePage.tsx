// MinePage 负责底部「我的」主入口的 MVP 占位。
// 后续偏好、记忆管理、隐私删除等真实功能接入时，从这里继续扩展。
export function MinePage() {
  return (
    <div className="tab-page mine-page">
      <header className="tab-page-header">
        <p>关于你和澈</p>
        <h1>我的</h1>
      </header>

      <section className="mine-card">
        <p className="card-label">澈</p>
        <h2>28 岁，自由职业体验设计师</h2>
        <p>他有自己的项目、作息和生活边界。这里会逐步放下你们相处时需要被记住的偏好。</p>
      </section>

      <section className="mine-list" aria-label="我的设置">
        <button type="button">
          <span>
            <strong>我的偏好</strong>
            <small>饮食、运动、聊天节奏</small>
          </span>
          <span aria-hidden="true">&gt;</span>
        </button>
        <button type="button">
          <span>
            <strong>记忆管理</strong>
            <small>查看澈记得的小事</small>
          </span>
          <span aria-hidden="true">&gt;</span>
        </button>
        <button type="button">
          <span>
            <strong>隐私与删除记录</strong>
            <small>清除数据的入口会放在这里</small>
          </span>
          <span aria-hidden="true">&gt;</span>
        </button>
      </section>
    </div>
  );
}
