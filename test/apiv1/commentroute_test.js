xit('Creation of a comment on a comment using /apiv1/threads/:id/comment/:comment', (done) => {
    request(app)
        .post(`/apiv1/threads/${t._id}/comment/`)
        .set('token', token)
        .expect(200)
        .send({
            content: 'No just no...'
        })
        .end((err, response) => {
            Comment.findOne({threadId: t._id, content: 'No just no...'}).then((comment) => {
                assert(comment !== null);
                done();
            });
        });
});
