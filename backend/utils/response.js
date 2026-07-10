export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

export const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ message });
};
