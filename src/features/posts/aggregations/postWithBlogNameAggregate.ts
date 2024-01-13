export const postWithBlogNameAggregate = (match?: Record<string, any>) => {
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
