import PostModel from '../models/PostModel.js';

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec().select('name surname').lean();
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

    const posts = await PostModel.find({ userId })
      .populate({
        path: 'userId',
        select: 'name surname',
      })
      .exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No tests found for this teacher' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const userForm = req.userForm;
    const userRole = req.userRole;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    const posts = await PostModel.find({ forms: { $in: userForm } }) // Use $in operator to match posts with forms in the user's form array
      .populate({
        path: 'userId',
        select: 'name surname',
      })
      .exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No post was found for your form' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.postId;
    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 0 },
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
      forms: req.body.forms,
      updated: false,
      success: true,
    });

    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Unbale to create post' });
    console.log(error);
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.postId;

    const deletedPost = await PostModel.findOneAndDelete({
      _id: postId,
    });

    if (!deletedPost) {
      return res.status(404).json({ error: 'Unable to find post' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Unable to delete post',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.postId;

    await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        forms: req.body.forms,
        updated: true,
      },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to update post',
    });
  }
};
