import {
  deleteZeroTrustListsAtOnce,
  deleteZeroTrustListsOneByOne,
  getZeroTrustLists,
} from "./lib/api.js";
import { FAST_MODE } from "./lib/constants.js";
import { notifyWebhook } from "./lib/helpers.js";

(async () => {
  const { result: lists } = await getZeroTrustLists();

  if (!lists) {
    console.warn(
      "No file lists found - this is not an issue if it's your first time running this script. Exiting."
    );
    return;
  }

  const cgpsLists = lists.filter(({ name }) => name.startsWith("CGPS List"));
  const piholelist = lists.filter(({ name }) => name.startsWith("pihole_domain"));

  if (!cgpsLists.length) {
    console.warn(
      "No lists with matching name found - this is not an issue if you haven't created any filter lists before. Exiting."
    );
    return;
  }

  console.log('Hello World!')

  console.log(
    `Got ${lists.length} lists, ${cgpsLists.length} of which are CGPS lists that will be deleted. ${piholelist.length} of which are PI Hole lists that will be deleted. `
  );

  console.log(`Deleting ${cgpsLists.length} lists...`);

  if (FAST_MODE) {
    await deleteZeroTrustListsAtOnce(cgpsLists);
    // TODO: make this less repetitive
    await notifyWebhook(`CF List Delete script finished running (${cgpsLists.length} lists)`);
    return;
  }

  await deleteZeroTrustListsOneByOne(cgpsLists);

  console.log(`Deleting ${piholelist.length} lists...`);

  await deleteZeroTrustListsOneByOne(piholelist);

  await notifyWebhook(`CF List Delete script finished running (${cgpsLists.length} lists)`);
})();
