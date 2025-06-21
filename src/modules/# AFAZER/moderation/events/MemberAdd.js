const client = require('../../../index');
const { getAccessToken, addMemberToServer } = require('../../../handler/api/oauth2');

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const roleMapping = {
        '1140885652544692284': '1187523201924870184', // mecanico => mecanica
        '1141609954596364318': '1184290068668616744', // medico => hospital
        '1140885582541758474': '1259168911509684386', // policial => policia geral
        '1140885636874784838': '1216142978590970116', // juridico => tribunal
        '1227000330907160689': '1178069520628338779', // ilegal => ilegal
        '1141610280124678276': '1178069520628338779', // lider ilegal => ilegal
        '1140887352835850241': '1186858434335879168', // fotografo => criadores
        '1246215036859584615': '1186858434335879168', // starter => criadores
        '1246214984250429510': '1186858434335879168', // creator => criadores
        '1191546460873969825': '1186858434335879168', // streamer => criadores
        '1140886195111473222': '1186858434335879168', // influencer => criadores
        '1185979654776029254': '1184289758399168512', // kids => escolinha
        '1141512716792635514': ['1265882299619082292', '1136112924021231727'], // staff euphoria => staff, logs
    };

    for (const roleId in roleMapping) {
        if (!oldMember.roles.cache.has(roleId) && newMember.roles.cache.has(roleId)) {
            const serversToAdd = roleMapping[roleId];
            const accessToken = getAccessToken(newMember.id);

            if (!accessToken) {
                return;
            }

            if (Array.isArray(serversToAdd)) {
                for (const serverId of serversToAdd) {
                    await addMemberToServer(newMember.id, serverId, accessToken);
                }
            } else {
                await addMemberToServer(newMember.id, serversToAdd, accessToken);
            }
        }
    }
});
