import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({
      error: 'Unable to get posts',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
    )
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: 'Article not found',
          });
        }

        res.json(doc);
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Error return article',
          });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Unable to get posts',
    });
  }
};

export const create = async (req, res) => {
  try {
    const newPost = await PostModel.create({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Unbale to create post' });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete({
      _id: postId,
    })
      .then((doc) => {
        if (!doc) {
          res.status(404).json({ error: 'Unable to find post' });
        }

        res.json({ success: true });
      })
      .catch((error) => {
        if (error) {
          res.status(500).json({ error: 'Unable to delete post' });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Unable to get posts',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
      },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to update post',
    });
  }
};
