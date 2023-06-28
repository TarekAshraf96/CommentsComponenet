const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const randomString = require('randomstring');
const ModalPage = require('../../Pages/ModalPage');
const Environment = require('../../Data/Environment.json');
const commentsAPIs = require('../../Apis/CommentsAPIs');

let cdPage;
let cdContext;
let browser;
let cdState;
let modalPage;
let postIdValue;
let dataSourceIdValue;

test.describe('Modal component CD Tests', () => {
  test.beforeAll(async () => {
    // getting CD state to pass to the new browsers
    cdState = JSON.parse(fs.readFileSync('CDstate.json'));
  });

  test.beforeEach(async () => {
    // start browsers with the correct states for CM and CD
    browser = await chromium.launch({args: ['--start-maximized'] });
    cdContext = await browser.newContext({ viewport: { width: 1366, height: 768 }, storageState: cdState });
    cdPage = await cdContext.newPage();

    modalPage = new ModalPage(cdPage, cdContext);

    // wait for get comments api to be called and get the postId and DataSource from it
    const requestPromise = cdPage.waitForRequest((url) => url.url().includes('getTrendyComments'));
    await cdPage.goto(`${Environment.CDURL}AutoData/ModalPage`, { waitUntil: 'networkidle' });
    const request = await requestPromise;
    const urlParams = new URLSearchParams(request.url().split('?')[1]);
    postIdValue = urlParams.get('postId');
    dataSourceIdValue = urlParams.get('DataSourceId');
   
  });

   test('Validate [There are no comments to show] Message', async () => {

     await modalPage.clickOnModal(3);
     await expect(await modalPage.returnNoCommentsMessage()).toBeVisible();
   });

  test('Add and Check Shared Comment in Listing', async () => {

    await modalPage.clickOnModal(3);
    const comment = randomString.generate(7);
    await modalPage.addNewComment(comment);
    await expect(await modalPage.returnComment(comment, Environment.CDUserShortName)).toBeVisible();
    await modalPage.closeModal();
    cdPage.reload({ waitUntil: 'networkidle' });

    await modalPage.clickOnModal(4);
    await expect(await modalPage.returnComment(comment, Environment.CDUserShortName)).toBeVisible();
    await modalPage.closeModal();

    await modalPage.clickOnModal(5);
    await expect(await modalPage.returnComment(comment, Environment.CDUserShortName)).toBeVisible();
  });


  test('Add Shared Reaction in listing', async () => {

    await modalPage.clickOnModal(2);
    await modalPage.reactToSharedItem(modalPage.Reactions.Like);
    await expect.soft(await modalPage.returnSharedReaction(modalPage.Reactions.Like, 1)).toBeVisible();
    await modalPage.closeModal();
    await modalPage.clickOnModal(1);
    await expect.soft(await modalPage.returnSharedReaction(modalPage.Reactions.Like, 1)).toBeVisible();
    await modalPage.reactToSharedItem(modalPage.Reactions.Like);
    await expect.soft(await modalPage.returnSharedReaction(modalPage.Reactions.Like, 1)).not.toBeVisible();
  });

  test('Add Reaction in context item', async () => {
   
    //Add a reaction in frst tile
    await modalPage.clickOnModal(1);
    await modalPage.reactToContextItem(modalPage.Reactions.Like);
    await expect.soft(await modalPage.returnContextReaction(modalPage.Reactions.Like, 1)).toBeVisible();
    await modalPage.closeModal();

    //Check the reaction not Added in second tile
    await modalPage.clickOnModal(2);
    await expect.soft(await modalPage.returnContextReaction(modalPage.Reactions.Like, 1)).not.toBeVisible();
    await modalPage.closeModal();

    //Remove the reaction from first tile
    await modalPage.clickOnModal(1);
    await modalPage.reactToContextItem(modalPage.Reactions.Like);
    await expect.soft(await modalPage.returnContextReaction(modalPage.Reactions.Like, 1)).not.toBeVisible();
  });


  test.afterEach(async () => {
    // Delete All comments
    const allComments = await commentsAPIs.getAllComments(cdState, postIdValue, dataSourceIdValue);
    for (let i = 0; i < allComments.Comments.length; i += 1) {
        await commentsAPIs.deleteComment(cdState, postIdValue, dataSourceIdValue, allComments.Comments[i].Id, allComments.Comments[i].ModifiedOn);
      }
   
    await browser.close();
  });
});