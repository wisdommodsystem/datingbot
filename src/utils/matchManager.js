const fs = require('fs');
const path = require('path');

const matchesPath = path.join(__dirname, '../../data/matches.json');
const allowedPath = path.join(__dirname, '../../data/allowed.json');

// Load matches from JSON file
function loadMatches() {
  try {
    const data = fs.readFileSync(matchesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { couples: [] };
  }
}

// Save matches to JSON file
function saveMatches(matches) {
  try {
    fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving matches:', error);
    return false;
  }
}

// Add a new couple
function addCouple(user1Id, user2Id, stage = 1) {
  const matches = loadMatches();
  const newCouple = {
    user1: user1Id,
    user2: user2Id,
    stage: stage,
    matched_at: new Date().toISOString(),
    role: null
  };
  
  matches.couples.push(newCouple);
  return saveMatches(matches);
}

// Find couple by user IDs
function findCouple(user1Id, user2Id) {
  const matches = loadMatches();
  return matches.couples.find(couple => 
    (couple.user1 === user1Id && couple.user2 === user2Id) ||
    (couple.user1 === user2Id && couple.user2 === user1Id)
  );
}

// Find couple by single user ID
function findCoupleByUser(userId) {
  const matches = loadMatches();
  return matches.couples.find(couple => 
    couple.user1 === userId || couple.user2 === userId
  );
}

// Update couple stage
function updateCoupleStage(user1Id, user2Id, stage) {
  const matches = loadMatches();
  const coupleIndex = matches.couples.findIndex(couple => 
    (couple.user1 === user1Id && couple.user2 === user2Id) ||
    (couple.user1 === user2Id && couple.user2 === user1Id)
  );
  
  if (coupleIndex !== -1) {
    matches.couples[coupleIndex].stage = stage;
    console.log(`✅ Updated couple stage to ${stage} for users ${user1Id} and ${user2Id}`);
    return saveMatches(matches);
  }
  
  console.log(`❌ Couple not found for users ${user1Id} and ${user2Id}`);
  return false;
}

// Update couple role
function updateCoupleRole(user1Id, user2Id, roleName) {
  const matches = loadMatches();
  const coupleIndex = matches.couples.findIndex(couple => 
    (couple.user1 === user1Id && couple.user2 === user2Id) ||
    (couple.user1 === user2Id && couple.user2 === user1Id)
  );
  
  if (coupleIndex !== -1) {
    matches.couples[coupleIndex].role = roleName;
    console.log(`✅ Updated couple role to ${roleName} for users ${user1Id} and ${user2Id}`);
    return saveMatches(matches);
  }
  
  console.log(`❌ Couple not found for users ${user1Id} and ${user2Id}`);
  return false;
}

// Remove couple
function removeCouple(user1Id, user2Id) {
  const matches = loadMatches();
  const index = matches.couples.findIndex(couple => 
    (couple.user1 === user1Id && couple.user2 === user2Id) ||
    (couple.user1 === user2Id && couple.user2 === user1Id)
  );
  
  if (index !== -1) {
    matches.couples.splice(index, 1);
    return saveMatches(matches);
  }
  return false;
}

// Get all couples
function getAllCouples() {
  return loadMatches().couples;
}

function loadAllowed() {
  try {
    const data = fs.readFileSync(allowedPath, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    return [];
  }
}

function saveAllowed(users) {
  try {
    fs.writeFileSync(allowedPath, JSON.stringify({ users }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving allowed users:', error);
    return false;
  }
}

function addPrivilegedUser(userId) {
  const users = loadAllowed();
  if (!users.includes(userId)) {
    users.push(userId);
    return saveAllowed(users);
  }
  return false;
}

function removePrivilegedUser(userId) {
  let users = loadAllowed();
  if (users.includes(userId)) {
    users = users.filter(id => id !== userId);
    return saveAllowed(users);
  }
  return false;
}

function isPrivilegedUser(userId) {
  const users = loadAllowed();
  return users.includes(userId);
}

function getAllPrivilegedUsers() {
  return loadAllowed();
}

module.exports = {
  loadMatches,
  saveMatches,
  addCouple,
  findCouple,
  findCoupleByUser,
  updateCoupleStage,
  updateCoupleRole,
  removeCouple,
  getAllCouples,
  // Privileged user management
  addPrivilegedUser,
  removePrivilegedUser,
  isPrivilegedUser,
  getAllPrivilegedUsers
}; 