module.exports = (client) => {
  // require('../handler/apiServer')(client);
  require('../handler/eventsPath')(client);
  require('../handler/onInteraction')(client);
  require('../handler/slashCommands')(client);
  require('../utils/onError')(client);
};