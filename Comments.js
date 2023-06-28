class Comments {
  constructor(page, context) {
    // locators
    this.page = page;
    this.context = context;
    this.commentsParentDiv = '.dozen-comments';
    this.noCommentsElement = '//div[text()="There are no comments to show"]';
    this.outDatedComments = '.outdated-server';
    this.refreshOutDatedLink = '.outdated-server-link';

    this.commentInput = '.comment-input';
    this.commentButton = '.comment-btn';
    this.commentWrapper = '.comment-item-wrapper';
    this.commentWrapperAncestor = '//ancestor::div[contains(@class, "comment-item-wrapper")]';

    this.commentData = '.comment-data';
    this.commentDataAncestor = '//ancestor::div[@class = "comment-data"]';
    this.commentUserName = '.comment-user-name';
    this.commentTime = '.comment-time';
    this.commentText = '.comment-text';

    this.commentReplyButton = '.text-sm.font-bold.leading-none';
    this.commentReplyWrapper = '.reply-wrapper';
    this.commentReplyWrapperAncestor = '//ancestor::div[@class = "reply-wrapper "]';

    this.commentManageIcon = '.actions-dropdown-button';
    this.commentEditDeleteButton = '[role = "menuitem"]';

    this.commentReactionMainIcon = '.reaction.popover-reaction';
    this.commentReactionOption = 'button.reaction.reaction-image';

    this.reactionCount = '.text-sm';
    this.reactionFlexWrapper = '.flex-wrapper.items-center.gap-1';
    this.reactionFlexWrapperAncestor = '//ancestor::div[contains(@class, "flex-wrapper items-center gap-1")]';
    this.commentFlexWrapper = '.flex-wrapper.mt-2';

    this.commentEditInput = '.comment-edit-area';
    this.commentEditSaveDiscardButton = '.save-discard';
    this.confirmDeleteMsgDiv = '.deleteConfirm-msg';

    this.postReactionsList = '.all-reactions-flyout'
    this.postReactionMainIcon = '.all-reactions-trigger.reaction.popover-reaction';
    this.postReactionOption = '.all-reactions-flyout .dozen-reactions-flyout-item';
    this.postReactionWrapper = '.dozen-reactions-item';
    this.postReactionWrapperAncestor = '//ancestor::div[@class = "dozen-reactions-item"]';
    this.postReactionCount = '[x-text="item.Statistics"]';
    this.loadMoreButton = '.load-more';
    this.reactionSummary = '//div[@class="component dozen-interactions-component col-12 col-md-6 col-lg-6"][2]';
    this.PostReactionSummary = 'span[x-text="result.reactionsCount"]'

    this.rateSection = '.dozen-ratings.interactive';
    this.ratingWrapper = '//div[@class="rating-wrapper"]';
    this.rateEdit = '.rating--edit span';
    this.ratingAvg = '.rating-avg span';
    this.ratingSummray = '.summary-section-total-raters span[class="summary-section-text"]'
    
    this.totalNumberOfComments = 'div.dozen-interaction-type span[x-text="result.TotalComments"]';
    this.totalNumberOfCommentsComponent = '.comments-count'

    this.disabledRating = '.dozen-ratings[data-postname = "Disabled Interactions Component]'

    this.Reactions = {
      Like: 'Like',
      Love: 'Love',
      Laugh: 'Laugh',
      Surprised: 'Surprised',
      Care: 'Care',
    };
  }

  async returnNoCommentsMessage() {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.noCommentsElement);
  }

  async returnOutDatedCommentsMessage() {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.outDatedComments);
  }

  async clickRefreshNowLink() {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.refreshOutDatedLink)
      .click();
  }

  async addNewComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentInput)
      .fill(comment);

    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentButton)
      .click();
  }

  async returnComment(comment) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` });
  }

  async returnCommentAndUser(comment, userName) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentDataAncestor)
      .locator(this.commentUserName, { hasText: `${userName}` });
  }

  async clickManageComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentManageIcon)
      .nth(0)
      .click();
  }

  async clickEditComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentEditDeleteButton, { hasText: 'Edit' })
      .click();
  }

  async clickSaveDiscardComment(option) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentEditSaveDiscardButton, { hasText: `${option}` })
      .click();
  }

  async editComment(comment, editText) {
    await this.clickManageComment(comment);
    await this.clickEditComment(comment);
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentEditInput)
      .fill(editText);
    await this.clickSaveDiscardComment('Save');
  }

  async clickDeleteComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentEditDeleteButton, { hasText: 'Delete' })
      .click();
  }

  async confirmDeleteItem(option) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.confirmDeleteMsgDiv)
      .locator('button', { hasText: `${option}` })
      .click();
  }

  async deleteComment(comment) {
    await this.clickManageComment(comment);
    await this.clickDeleteComment(comment);
    await this.confirmDeleteItem('Yes');
  }

  async clickReplyToComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentReplyButton)
      .click();
  }

  async clickConfirmReplyToComment() {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentWrapper)
      .locator(this.commentButton)
      .click();
  }

  async replyToComment(comment, reply) {
    await this.clickReplyToComment(comment);
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentWrapper)
      .locator(this.commentInput)
      .fill(reply);
    await this.clickConfirmReplyToComment();
  }

  async returnCommentReplyAndUser(comment, userName, reply) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentDataAncestor)
      .locator(this.commentUserName, { hasText: `${userName}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` });
  }

  async clickManageCommentReply(reply) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentManageIcon)
      .click();
  }

  async clickEditCommentReply(reply) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentEditDeleteButton, { hasText: 'Edit' })
      .click();
  }

  async editCommentReply(oldReply, newReply) {
    await this.clickManageCommentReply(oldReply);
    await this.clickEditCommentReply(oldReply);
    this.page.locator(this.commentsParentDiv)
      .locator(this.commentEditInput)
      .fill(newReply);
    await this.clickSaveDiscardComment('Save');
  }

  async clickDeleteCommentReply(reply) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentEditDeleteButton, { hasText: 'Delete' })
      .click();
  }

  async deleteCommentReply(reply) {
    await this.clickManageCommentReply(reply);
    await this.clickDeleteCommentReply(reply);
    await this.confirmDeleteItem('Yes');
  }

  async clickReactToComment(comment) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentWrapper)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentReactionMainIcon)
      .click();
  }

  async reactToComment(comment, reaction) {
    await this.clickReactToComment(comment);
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentWrapper)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentReactionOption)
      .getByTitle(reaction)
      .click();
  }

  async returnCommentReaction(comment, reaction, reactionCount) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
    // .locator(this.commentReactionSummary)
      .locator(this.reactionFlexWrapper)
      .getByTitle(reaction)
      .locator(this.reactionFlexWrapperAncestor)
      .locator(this.reactionCount, { hasText: `${reactionCount}` });
  }

  async clickReactToReply(reply) {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentReactionMainIcon)
      .click();
  }

  async reactToReply(reply, reaction) {
    await this.clickReactToReply(reply);
    await this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentReactionOption)
      .getByTitle(reaction)
      .click();
  }

  async returnReplyReaction(reply, reaction, reactionCount) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      // .locator(this.commentReactionSummary)
      .locator(this.reactionFlexWrapper)
      .getByTitle(reaction)
      .locator(this.reactionFlexWrapperAncestor)
      .locator(this.reactionCount, { hasText: `${reactionCount}` });
  }

  async returnCommentReactionWrapper(comment) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentData)
      .locator(this.commentText, { hasText: `${comment}` })
      .locator(this.commentWrapperAncestor)
      .locator(this.commentFlexWrapper);
  }

  async returnReplyReactionWrapper(reply) {
    return this.page.locator(this.commentsParentDiv)
      .locator(this.commentReplyWrapper)
      .locator(this.commentText, { hasText: `${reply}` })
      .locator(this.commentReplyWrapperAncestor)
      .locator(this.commentFlexWrapper);
  }

  async clickReactToPost() {
    await this.page.locator(this.postReactionMainIcon)
      .click();
  }

  async reactToPost(reaction) {
    await this.clickReactToPost();
    await this.page.locator(this.postReactionOption)
      .getByTitle(reaction)
      .click();
  }

  async ratePost(ratingValue) {
    await this.page.locator(this.rateSection)
      .locator(this.ratingWrapper)
      .locator(this.rateEdit)
      .nth(ratingValue - 1)
      .click({ force: true });
  }

  async returnPostReaction(reaction, reactionCount) {
    return this.page.locator(this.postReactionWrapper)
      .getByTitle(reaction)
      .locator(this.postReactionWrapperAncestor)
      .locator(this.postReactionCount, { hasText: `${reactionCount}` });
  }

  async returnPostRating() {
    return this.page.locator(this.ratingAvg)
      .innerText();
  }

  async returnPostCommentsCount() {
    return this.page.locator(this.totalNumberOfComments).innerText();
  }

  async returnCommentsComponentCount() {
    return this.page.locator(this.totalNumberOfCommentsComponent).innerText();
  }

  async returnComments() {
    const comments = await this.page.$$eval(
      `${await this.commentsParentDiv} ${this.commentText}`,
      (elements) => elements.map((el) => el.innerText.trim()),
    );
    return comments;
  }

  async returnReplies() {
    const replies = await this.page.$$eval(
      `${await this.commentReplyWrapper} ${this.commentText}`,
      (elements) => elements.map((el) => el.innerText.trim()),
    );
    return replies;
  }

  async clickLoadMoreButton() {
    await this.page.locator(this.commentsParentDiv)
      .locator(this.loadMoreButton)
      .click();
  }

  async returnPostReactionList() {
    return this.page.locator(this.postReactionsList);
  }

  async returnRatingSummary() {
    return this.page.locator(this.ratingSummray)
    .innerText();
  }
  
  async returnReactionSummary() {
    const reactionsCount =  await this.page.locator(this.PostReactionSummary).innerText();
     return parseInt(reactionsCount);

  }

  async returnReactionMainIcon() {
    return await this.page.locator(this.postReactionMainIcon)
  }

  async returnCommentInput() {
   return await this.page.locator(this.commentsParentDiv)
      .locator(this.commentInput)
  }

  async returnDisabledRating() {
    return await this.page.locator(this.disabledRating)
   }


}
module.exports = Comments;
