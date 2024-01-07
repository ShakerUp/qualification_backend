import PostModel from '../models/PostModel.js';

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

export const getTeacherPosts = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const posts = await PostModel.find({ userId }).populate('userId').exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No tests found for this teacher' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
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
      userId: req.userId,
      succes: true,
    });

    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Unbale to create post' });
    console.log(error);
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
