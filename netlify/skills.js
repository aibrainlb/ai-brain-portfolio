// Netlify Serverless Function - Skills API

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  const skills = [
    { name: "Blender", category: "3D Design", level: 90, icon: "fas fa-cube" },
    { name: "Godot", category: "Game Development", level: 85, icon: "fas fa-gamepad" },
    { name: "Unity", category: "Game Development", level: 80, icon: "fab fa-unity" },
    { name: "C#", category: "Programming", level: 88, icon: "fas fa-code" },
    { name: "Python", category: "Programming", level: 92, icon: "fab fa-python" },
    { name: "JavaScript", category: "Programming", level: 90, icon: "fab fa-js" },
    { name: "HTML/CSS", category: "Frontend", level: 95, icon: "fab fa-html5" },
    { name: "Node.js", category: "Backend", level: 90, icon: "fab fa-node-js" },
    { name: "Express.js", category: "Backend", level: 88, icon: "fas fa-server" },
    { name: "AI/ML", category: "CS & AI", level: 87, icon: "fas fa-brain" },
    { name: "Database Design", category: "Database", level: 89, icon: "fas fa-database" },
    { name: "MongoDB", category: "Database", level: 88, icon: "fas fa-leaf" }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      count: skills.length,
      data: skills
    })
  };
};
