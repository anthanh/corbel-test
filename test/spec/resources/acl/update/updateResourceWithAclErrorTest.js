describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing update resources', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var user;
            var adminUser;
            var resourceId;
            var random;
            var usersId;
            var groupId;
            var TEST_OBJECT;
            var TEST_OBJECT_UPDATE;
            var dataType;

            before(function(){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            beforeEach(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];
                groupId = 'testGroup' + random;
                dataType = {dataType: 'application/json'};
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };
                TEST_OBJECT_UPDATE = {
                    test: 'testUpdate' + random,
                    test2: 'test2Update' + random
                };

                corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.iam.createUsers(corbelDriver, 1, {'groups': [groupId]})
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser){
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelTest.common.clients.loginUser
                    (corbelAdminDriver, adminUser.username, adminUser.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete(dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    var promises = usersId.map(function(userId){
                        return corbelRootDriver.iam.user(userId)
                            .delete()
                        .should.be.eventually.fulfilled;
                    });

                    return Promise.all(promises);
                })
                .should.notify(done);
            });

            it('an error 401 is returned if the user only has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });

            it('an error 401 is returned if the users group only has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });

            it('an error 401 is returned if ALL users have READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });
        });
    });
});
