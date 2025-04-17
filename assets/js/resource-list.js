const username = "your-username"; // 替换为你的 GitHub 用户名
const repo = "your-repo";         // 替换为你的 GitHub 仓库名
const folder = "resources";

async function fetchResources() {
  const container = document.getElementById("resource-container");
  container.innerHTML = "<p>加载资源中...</p>";

  const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folder}`);
  const data = await res.json();

  container.innerHTML = ""; // 清空加载提示

  for (let file of data) {
    const { name, size, download_url, path } = file;

    // 获取文件最后修改时间（通过提交）
    const commitsRes = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?path=${path}&per_page=1`);
    const commits = await commitsRes.json();
    const lastModified = commits[0]?.commit?.committer?.date || "";

    const card = document.createElement("a");
    card.className = "content-card";
    card.href = `preview.html?file=${encodeURIComponent(name)}`; // 点进去跳转预览页
    card.innerHTML = `
      <img src="../assets/images/resource.png" alt="资源图片">
      <h3>${name}</h3>
      <p>
        类型：${getFileType(name)}　
        大小：${formatSize(size)}　
        日期：${formatDate(lastModified)}
      </p>
    `;
    container.appendChild(card);
  }
}

function getFileType(name) {
  return name.split('.').pop().toUpperCase();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('zh-CN');
}

fetchResources();
