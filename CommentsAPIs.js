const { request } = require('@playwright/test');

const Environment = require('../Data/Environment.json');

const envURL = Environment.CDURL;

class CommentsAPIs {
  static ReactionsIds = {
    Like: '{2B0625A1-2F1D-46CC-98C2-3C1C916067E2}',
    Love: '{ACA9CD7B-E128-4056-BA8E-7AF94E201FC9}',
    Laugh: '{FE64372C-FC31-4D4C-9FCE-A0EAEE48D5A6}',
    Surprised: '{B5223DFA-D654-422F-90A0-652368408DFC}',
    Care: '{402D049F-D8AE-4F28-AD0C-1EAC1AB88DC8}',
  };

  static async getAllComments(storageState, postId, dataSourceId) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.get(`${envURL}api/dozen/1.0/interactions/getTrendyComments`, {
      params: {
        postId,
        dataSourceId,
        offset: 0,
        limit: 50,
        orderByCriteria: 2,
        orderByType: 2,
        repliesLimit: 30,
      },
    });
    const responseBodyJson = JSON.stringify(await response.json());
    if (JSON.parse(responseBodyJson) == null) { return { Comments: [] }; }
    return JSON.parse(responseBodyJson);
  }

  static async addComment(storageState, postId, dataSourceIdValue, comment) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.post(`${envURL}api/dozen/1.0/interactions/AddCommentWithPost`, {
      params: {
        dataSourceId: dataSourceIdValue,
        lastModifiedDate: new Date().toISOString(),
      },
      data: {
        Comment: { CommentText: comment },
        Post: {
          AllowComments: 1,
          DataSourceId: dataSourceIdValue,
          PostId: postId,
        },
      },
    });
    const responseBodyJson = JSON.stringify(await response.json());
    return JSON.parse(responseBodyJson).Id;
  }

  static async deleteComment(storageState, postId, dataSourceId, commentId, lastModificationDate) {
    const requestContext = await request.newContext({ storageState });
    await requestContext.patch(`${envURL}api/dozen/1.0/interactions/deleteComment`, {
      params: {
        CommentId: commentId,
        postId,
        dataSourceId,
        lastModifiedDate: lastModificationDate,
      },
    });
  }

  static async addReply(storageState, postId, dataSourceIdValue, commentId, reply) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.post(`${envURL}api/dozen/1.0/interactions/AddComment`, {
      params: {
        dataSourceId: dataSourceIdValue,
        lastModifiedDate: new Date().toISOString(),
      },
      data: {
        CommentText: reply,
        ParentCommentId: commentId,
        PostId: postId,
      },
    });
    const responseBodyJson = JSON.stringify(await response.json());
    return JSON.parse(responseBodyJson).Id;
  }

  static async reactToItem(storageState, commentId, reactionId) {
    const requestContext = await request.newContext({ storageState });
    await requestContext.post(`${envURL}api/dozen/1.0/interactions/reactToComment`, {
      data: {
        CommentId: commentId,
        ReactionId: reactionId,
      },
    });
  }

  static async ratePost(storageState, dataSourceIdValue, postId, value) {
    const requestContext = await request.newContext({ storageState });
    await requestContext.post(`${envURL}api/dozen/1.0/rating/ratepost`, {
      data: {
        DataSourceId: dataSourceIdValue,
        PostId: postId,
        Value: value,
      },
    });
  }
}
module.exports = CommentsAPIs;
