import nodeHtmlToImage from 'node-html-to-image';

export const generateCertificateImage = async (quizResult) => {
  const htmlTemplate = `
  <html>
    <head><style>
      body { font-family: Arial; padding: 40px; text-align: center; background: #fff; }
      h1 { color: #4b6cb7; }
      p { font-size: 20px; }
      .cert { border: 8px solid #4b6cb7; padding: 40px; border-radius: 20px; }
    </style></head>
    <body>
      <div class="cert">
        <h1>SkillBridge Certificate of Completion</h1>
        <p>This certifies that</p>
        <h2>${quizResult.userName}</h2>
        <p>has successfully completed</p>
        <h3>${quizResult.courseTitle}</h3>
        <p>with a score of ${quizResult.score}/${quizResult.total} (${quizResult.percentage.toFixed(1)}%)</p>
        <p>Date: ${new Date(quizResult.completedAt).toDateString()}</p>
      </div>
    </body>
  </html>`;

  const image = await nodeHtmlToImage({ html: htmlTemplate, type: 'png', encoding: 'buffer' });
  return image;
};
