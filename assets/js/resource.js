const GITHUB_USER = "ginvgo";
const GITHUB_REPO = "DS2325";
const GITHUB_FOLDER = "resource";

function getFileType(filename) {
  return filename.split('.').pop().toUpperCase();
}

function formatSize(size) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return size.toFixed(1) + ' ' + units[i];
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

async function fetchResources() {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}`);
  const files = await res.json();

  if (!Array.isArray(files) || files.length === 0) {
    document.querySelector(".content-grid").innerHTML = `
      <div class="content-card">
        <img src="../assets/images/empty.png" />
        <h3>暂无资源</h3>
        <p>目前没有可供下载的文件</p>
      </div>`;
    return;
  }

  const content = await Promise.all(
    files.map(async file => {
      const commitsRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?path=${GITHUB_FOLDER}/${file.name}&per_page=1`);
      const commits = await commitsRes.json();
      const lastModified = commits[0]?.commit?.committer?.date || "";

      const fileType = getFileType(file.name);
      const size = formatSize(file.size);
      const date = formatDate(lastModified);
      return `
        <a href="preview.html?file=${encodeURIComponent(file.name)}" class="content-card">
          <img src="../assets/images/resource.png" alt="资源预览" />
          <h3>${file.name}</h3>
          <p>类型：${fileType}　大小：${size}　日期：${date}</p>
        </a>
      `;
    })
  );

  document.querySelector(".content-grid").innerHTML = content.join('');
}
