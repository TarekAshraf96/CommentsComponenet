const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const randomString = require('randomstring');
const CDPageWithCommentsComponent = require('../../Pages/CDPageWithCommentsComponent');
const Environment = require('../../Data/Environment.json');
const commentsAPIs = require('../../Apis/CommentsAPIs');
const PersonCardPage = require('../../Pages/PersonCardPage');

let cdPage;
let cdContext;
let browser;
let cdState;
let articlePage;
let articlePage2;
let cdPage2;
let cdContext2;
let postIdValue;
let dataSourceIdValue;
let cdState2;
let personCardPage;

test.describe('Comments Tests', () => {
  test.beforeAll(async () => {
    // getting CD state to pass to the new browsers
    cdState = JSON.parse(fs.readFileSync('CDstate.json'));
    cdState2 = JSON.parse(fs.readFileSync('CDstate2.json'));
  });

  test.beforeEach(async () => {
    // start browsers with the correct states for CM and CD
    browser = await chromium.launch({ args: ['--start-maximized'] });
    cdContext = await browser.newContext({ viewport: null, storageState: cdState });

    cdPage = await cdContext.newPage();
    articlePage = new CDPageWithCommentsComponent(cdPage);
    personCardPage = new PersonCardPage(cdPage, cdContext);

    // wait for get comments api to be called and get the postId and DataSource from it
    const requestPromise = cdPage.waitForRequest((url) => url.url().includes('getTrendyComments'));
    await cdPage.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });
    const request = await requestPromise;
    const urlParams = new URLSearchParams(request.url().split('?')[1]);
    postIdValue = urlParams.get('postId');
    dataSourceIdValue = urlParams.get('DataSourceId');
    // Delete All comments
    const allComments = await commentsAPIs.getAllComments(cdState, postIdValue, dataSourceIdValue);
    for (let i = 0; i < allComments.Comments.length; i += 1) {
      if (Environment.CDUserShortName.includes(allComments.Comments[i].User.FirstName)) {
        await commentsAPIs.deleteComment(cdState, postIdValue, dataSourceIdValue, allComments.Comments[i].Id, allComments.Comments[i].ModifiedOn);
      } else { await commentsAPIs.deleteComment(cdState2, postIdValue, dataSourceIdValue, allComments.Comments[i].Id, allComments.Comments[i].ModifiedOn); }
    }
    // Refresh Page after deleting comments
    await cdPage.reload({ waitUntil: 'networkidle' });
  });

  test('Validate [There are no comments to show] Message', async () => {
    await expect(await articlePage.returnNoCommentsMessage()).toBeVisible();
  });

  test('Add Comment', async () => {
    const comment = randomString.generate(7);
    await articlePage.addNewComment(comment);
    await expect(await articlePage.returnCommentAndUser(comment, Environment.CDUserShortName)).toBeVisible();
  });

  test('Add Long Comment', async () => {
    const longComment = 'Long comment Long comment Long comment Long comment Long comment Long comment Long comment Long comment Long comment done';

    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, longComment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnCommentAndUser(longComment, Environment.CDUserShortName)).toBeVisible();

    const comment = await articlePage.returnComment(longComment);
    expect(await comment.screenshot()).toMatchSnapshot('longComment.png');
  });

  test('Edit comment', async () => {
    const oldComment = randomString.generate(7);
    const newComment = randomString.generate(5);

    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, oldComment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.replyToComment(oldComment, 'Reply');

    await articlePage.editComment(oldComment, newComment);

    await expect.soft(await articlePage.returnCommentAndUser(newComment, Environment.CDUserShortName)).toBeVisible();
    await expect.soft(await articlePage.returnComment(oldComment)).toHaveCount(0);
  });

  test('Delete Comment', async () => {
    const comment = randomString.generate(5);
    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.deleteComment(comment);
    await expect.soft(await articlePage.returnComment(comment)).toHaveCount(0);
  });

  test('Reply To Comment', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(5);
    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.replyToComment(comment, reply);
    await expect.soft(await articlePage.returnCommentReplyAndUser(comment, Environment.CDUserShortName, reply)).toBeVisible();
  });

  test('Edit Reply', async () => {
    const comment = randomString.generate(7);
    const oldReply = randomString.generate(5);
    const newReply = randomString.generate(6);
    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.replyToComment(comment, oldReply);
    await articlePage.editCommentReply(oldReply, newReply);
    await expect.soft(await articlePage.returnCommentReplyAndUser(comment, Environment.CDUserShortName, newReply)).toBeVisible();
    await expect.soft(await articlePage.returnCommentReplyAndUser(comment, Environment.CDUserShortName, oldReply)).toHaveCount(0);
  });

  test('Delete Reply', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(5);
    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.replyToComment(comment, reply);
    await articlePage.deleteCommentReply(reply);
    await expect.soft(await articlePage.returnCommentReplyAndUser(comment, Environment.CDUserShortName, reply)).toHaveCount(0);
  });

  test('React To Comment', async () => {
    const comment = randomString.generate(7);
    await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToComment(comment, articlePage.Reactions.Like);
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Like, 1)).toBeVisible();
  });

  test('Change Comment Reaction', async () => {
    const comment = randomString.generate(7);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await commentsAPIs.reactToItem(cdState, commentId, commentsAPIs.ReactionsIds.Like);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToComment(comment, articlePage.Reactions.Laugh);
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Like, 1)).toHaveCount(0);
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Laugh, 1)).toBeVisible();
  });

  test('Remove Comment Reaction', async () => {
    const comment = randomString.generate(7);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await commentsAPIs.reactToItem(cdState, commentId, commentsAPIs.ReactionsIds.Like);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToComment(comment, articlePage.Reactions.Like);
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Like, 1)).toHaveCount(0);
  });

  test('React To Comment With Different User', async () => {
    // #region Launch New Page With Different User
    cdContext2 = await browser.newContext({ storageState: cdState2 });
    cdPage2 = await cdContext2.newPage();
    articlePage2 = new CDPageWithCommentsComponent(cdPage2);
    await cdPage2.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });
    // #endregion

    const comment = randomString.generate(7);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await commentsAPIs.reactToItem(cdState, commentId, commentsAPIs.ReactionsIds.Like);
    await cdPage2.reload({ waitUntil: 'networkidle' });
    await articlePage2.reactToComment(comment, articlePage.Reactions.Laugh);
    await expect.soft(await articlePage2.returnCommentReaction(comment, articlePage2.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage2.returnCommentReaction(comment, articlePage2.Reactions.Laugh, 1)).toBeVisible();

    await cdPage.reload({ waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage.returnCommentReaction(comment, articlePage.Reactions.Laugh, 1)).toBeVisible();

    // Apply visual testing
    const areaToCompare = await articlePage.returnCommentReactionWrapper(comment);
    expect(await areaToCompare.screenshot()).toMatchSnapshot('CommentReactions.png');
  });

  test('React To Reply', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(8);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await commentsAPIs.addReply(cdState, postIdValue, dataSourceIdValue, commentId, reply);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToReply(reply, articlePage.Reactions.Like);
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Like, 1)).toBeVisible();
  });

  test('Change Reply Reaction', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(8);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    const replyId = await commentsAPIs.addReply(cdState, postIdValue, dataSourceIdValue, commentId, reply);
    await commentsAPIs.reactToItem(cdState, replyId, commentsAPIs.ReactionsIds.Like);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToReply(reply, articlePage.Reactions.Laugh);
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Like, 1)).toHaveCount(0);
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Laugh, 1)).toBeVisible();
  });

  test('Remove Reply Reaction', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(8);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    const replyId = await commentsAPIs.addReply(cdState, postIdValue, dataSourceIdValue, commentId, reply);
    await commentsAPIs.reactToItem(cdState, replyId, commentsAPIs.ReactionsIds.Like);
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.reactToReply(reply, articlePage.Reactions.Like);
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Like, 1)).toHaveCount(0);
  });

  test('React To Reply With Different User', async () => {
    // #region Launch New Page With Different User
    cdContext2 = await browser.newContext({ storageState: cdState2 });
    cdPage2 = await cdContext2.newPage();
    articlePage2 = new CDPageWithCommentsComponent(cdPage2);
    await cdPage2.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });
    // #endregion

    const comment = randomString.generate(7);
    const reply = randomString.generate(8);
    const commentId = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    const replyId = await commentsAPIs.addReply(cdState, postIdValue, dataSourceIdValue, commentId, reply);
    await commentsAPIs.reactToItem(cdState, replyId, commentsAPIs.ReactionsIds.Like);
    await cdPage2.reload({ waitUntil: 'networkidle' });
    await articlePage2.reactToReply(reply, articlePage.Reactions.Laugh);
    await expect.soft(await articlePage2.returnReplyReaction(reply, articlePage2.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage2.returnReplyReaction(reply, articlePage2.Reactions.Laugh, 1)).toBeVisible();

    await cdPage.reload({ waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage.returnReplyReaction(reply, articlePage.Reactions.Laugh, 1)).toBeVisible();

    // Apply visual testing
    const areaToCompare = await articlePage.returnReplyReactionWrapper(reply);
    expect(await areaToCompare.screenshot()).toMatchSnapshot('ReplyReactions.png');
  });

  test('Validate outdated comments message ', async () => {
    // #region Launch New Page With Different User
    cdContext2 = await browser.newContext({ storageState: cdState2 });
    cdPage2 = await cdContext2.newPage();
    articlePage2 = new CDPageWithCommentsComponent(cdPage2);
    await cdPage2.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });
    // #endregion

    const firstComment = randomString.generate(7);
    const secondComment = randomString.generate(7);
    await articlePage.addNewComment(firstComment);
    await articlePage2.addNewComment(secondComment);

    await expect.soft(await articlePage2.returnOutDatedCommentsMessage()).toHaveText('Comments is out dated, refresh now');

    await articlePage2.clickRefreshNowLink();
    await expect(await articlePage2.returnOutDatedCommentsMessage()).toHaveCount(0);
  });

  test('check load more comments', async () => {
    const comment = randomString.generate(7);
    for (let i = 1; i <= 7; i += 1) {
      await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    }
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.clickLoadMoreButton();
    await articlePage.page.waitForTimeout(3000);
    expect(await articlePage.returnComments()).toHaveLength(7, { timeout: 5000 });
  });

  test('check load more replies', async () => {
    const comment = randomString.generate(7);
    const reply = randomString.generate(5);
    const commentID = await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    await cdPage.reload({ waitUntil: 'networkidle' });
    for (let i = 1; i <= 5; i += 1) {
      await commentsAPIs.addReply(cdState, postIdValue, dataSourceIdValue, commentID, reply);
    }
    await cdPage.reload({ waitUntil: 'networkidle' });
    await articlePage.clickLoadMoreButton();
    await articlePage.page.waitForTimeout(3000);
    expect(await articlePage.returnReplies()).toHaveLength(5, { timeout: 5000 });
  });

  test('Check Reactions List', async () => {
    await articlePage.clickReactToPost();
    const reactionList = await articlePage.returnPostReactionList();
    expect(await reactionList.screenshot()).toMatchSnapshot('ReactionList.png');
  });

  test('React to Post With Different Users', async () => {
    cdContext2 = await browser.newContext({ storageState: cdState2 });
    cdPage2 = await cdContext2.newPage();
    articlePage2 = new CDPageWithCommentsComponent(cdPage2);
    await cdPage2.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });

    await articlePage.reactToPost(articlePage.Reactions.Like);
    await cdPage2.reload({ waitUntil: 'networkidle' });
    await articlePage2.reactToPost(articlePage.Reactions.Laugh);
    await expect.soft(await articlePage2.returnPostReaction(articlePage2.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage2.returnPostReaction(articlePage2.Reactions.Laugh, 1)).toBeVisible();
    await cdPage.reload({ waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnPostReaction(articlePage.Reactions.Like, 1)).toBeVisible();
    await expect.soft(await articlePage.returnPostReaction(articlePage.Reactions.Laugh, 1)).toBeVisible();

    expect(await (articlePage.returnReactionSummary())).toEqual(2);

    await articlePage.reactToPost(articlePage.Reactions.Like);
    await articlePage2.reactToPost(articlePage.Reactions.Laugh);
  });

  test('Rate Post With Different Users', async () => {
    // await commentsAPIs.ratePost(cdState,dataSourceIdValue , postIdValue ,1);
    // await commentsAPIs.ratePost(cdState2,dataSourceIdValue , dataSourceIdValue ,1);
    cdContext2 = await browser.newContext({ storageState: cdState2 });
    cdPage2 = await cdContext2.newPage();
    articlePage2 = new CDPageWithCommentsComponent(cdPage2);
    await cdPage2.goto(`${Environment.CDURL}AutoData/Comments-page`, { waitUntil: 'networkidle' });
    await articlePage.ratePost(3);
    await cdPage2.reload({ waitUntil: 'networkidle' });
    await articlePage2.ratePost(3);
    const overAllRating = (3 + 3) / 2;
    const actualRating = await articlePage.returnPostRating();
    const numericRegex = /\((\d+\.\d+)\)/;
    const match = numericRegex.exec(actualRating);
    const floatRating = match ? parseFloat(match[1]) : NaN;
    expect(floatRating).toEqual(overAllRating);

    expect(await (articlePage.returnRatingSummary())).toEqual(overAllRating);
  });

  test('Validate Total Number Of Post Comments', async () => {
    const comment = randomString.generate(7);
    for (let i = 1; i <= 5; i += 1) {
      await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    }
    await cdPage.reload({ waitUntil: 'networkidle' });
    const addedComments = '5';
    expect(await (articlePage.returnPostCommentsCount())).toEqual(addedComments);
    expect(await (articlePage.returnCommentsComponentCount())).toEqual(addedComments);
  });

  test('Validate Interactions Page Read Comments from Main Page', async () => {
    const comment = randomString.generate(7);
    for (let i = 1; i <= 5; i += 1) {
      await commentsAPIs.addComment(cdState, postIdValue, dataSourceIdValue, comment);
    }
    await cdPage.goto(`${Environment.CDURL}AutoData/Interactions%20Components%20Page`, { waitUntil: 'networkidle' });
    const addedComments = '5';
    expect(await (articlePage.returnPostCommentsCount())).toEqual(addedComments);
    const locator = await articlePage.returnComment(comment, Environment.CDUserShortName);
    const elements = await locator.elementHandles();
    expect(elements.length).toBe(5);
  });

  test('Validate Interactions Page Read Rating from Main Page', async () => {
    await articlePage.ratePost(3);
    await cdPage.goto(`${Environment.CDURL}AutoData/Interactions%20Components%20Page`, { waitUntil: 'networkidle' });
    const actualRating = await articlePage.returnPostRating();
    const numericRegex = /\((\d+\.\d+)\)/;
    const match = numericRegex.exec(actualRating);
    const floatRating = match ? parseFloat(match[1]) : NaN;
    expect(floatRating).toEqual(3);
  });

  test('Validate Interactions Page Read Reactions from Main Page', async () => {
    await articlePage.reactToPost(articlePage.Reactions.Like);
    await cdPage.goto(`${Environment.CDURL}AutoData/Interactions%20Components%20Page`, { waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnPostReaction(articlePage.Reactions.Like, 1)).toBeVisible();
  });

  test('Validate Disabled Reactions', async () => {
    await cdPage.goto(`${Environment.CDURL}AutoData/Disabled%20Interactions%20Components`, { waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnReactionMainIcon()).not.toBeVisible();
  });

  test('Validate Disabled Comments', async () => {
    await cdPage.goto(`${Environment.CDURL}AutoData/Disabled%20Interactions%20Components`, { waitUntil: 'networkidle' });
    await expect.soft(await articlePage.returnCommentInput()).not.toBeVisible();
  });

  test('Validate Disabled Rating', async () => {
    await cdPage.goto(`${Environment.CDURL}AutoData/Disabled%20Interactions%20Components`, { waitUntil: 'networkidle' });
    await expect(await articlePage.returnDisabledRating()).toBeVisible();
  });
  test('View Person Card Data', async () => {
    const joinerName = Environment.CDUserShortName;
    const joinerJob = Environment.CDUserJob;
    const joinerDepartment = Environment.CDUserDepartment;
    await personCardPage.hoverOnPersonalAvatarCardComment();
    await expect.soft(await personCardPage.returnPersonCardWithDetails(joinerName, joinerJob, joinerDepartment)).toBeVisible();
    await expect.soft(await personCardPage.returnLink('Send email')).toBeEnabled();
    await expect.soft(await personCardPage.returnLink('Start chat')).toBeEnabled();
  });
  test('Expand Person Card Data', async () => {
    const joinerName = Environment.CDUserShortName;
    const joinerJob = Environment.CDUserJob;
    const joinerDepartment = Environment.CDUserDepartment;
    const joinerEmail = Environment.CDUsername;
    const joinerTeams = Environment.CDUsername;
    const joinerOfficeLocation = Environment.CDUserTagComment;
    await personCardPage.hoverOnPersonalAvatarCardComment();
    await personCardPage.expandPersonCard();
    await expect(await personCardPage.returnExpandedPersonCardWithDetails(
      joinerEmail,
      joinerTeams,
      joinerDepartment,
      joinerJob,
      joinerOfficeLocation,
    )).toBeVisible();
  });

  test.afterEach(async () => {
    await browser.close();
  });
});
