describe('In ASSETS module', function() {

    describe('when a client asks for assets/access', function(){
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('request is rejected due to authorization reasons', function(done) {
            corbelDriver.assets.asset().access()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });

    describe('when no user is logged-in', function() {

        var corbelDriver, rootCorbelDriver;
        var user;

        before(function(done) {
            rootCorbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                user = response[0];
                return corbelTest.common.clients.loginUser( corbelDriver, user.username, user.password)
                 .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done){
            rootCorbelDriver.iam.user(user.id).delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('asset is not retrieved due to authorization reasons', function(done) {
            corbelDriver.assets.asset().access()
            .should.be.eventually.fulfilled
            .then(function(response){
                return corbelDriver.iam.user(user.id).disconnect()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                return corbelDriver.assets.asset().access()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });
    });
});
