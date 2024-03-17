import { PipelineStage } from 'mongoose';

export const postWithBlogNameAggregate = (match?: any): PipelineStage[] => {
  return [
    { $match: match },
    {
      $lookup: {
        from: 'blogs',
        localField: 'blogId',
        foreignField: 'id',
        as: 'blogInfo',
      },
    },
    {
      $unwind: '$blogInfo',
    },
    {
      $project: {
        _id: 0,
        id: 1,
        content: 1,
        title: 1,
        shortDescription: 1,
        blogId: 1,
        createdAt: 1,
        blogName: '$blogInfo.name',
      },
    },
  ];
};
